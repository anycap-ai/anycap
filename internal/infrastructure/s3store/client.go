package s3store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

// Client generates presigned PUT URLs and manages objects using the S3-compatible API.
type Client struct {
	s3Client      *s3.Client
	presignClient *s3.PresignClient
	bucket        string
	publicURL     string
	expiry        time.Duration
}

// NewClient creates a new S3 presign client from config.
func NewClient(ctx context.Context, cfg config.S3Config) (*Client, error) {
	resolver := aws.EndpointResolverWithOptionsFunc(
		func(service, region string, options ...any) (aws.Endpoint, error) {
			return aws.Endpoint{
				URL: cfg.Endpoint,
			}, nil
		},
	)

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(cfg.Region),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		),
		awsconfig.WithEndpointResolverWithOptions(resolver),
	)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = cfg.ForcePathStyle
	})

	publicURL := cfg.PublicURL
	if publicURL == "" {
		// Fallback: construct from endpoint + bucket.
		publicURL = cfg.Endpoint + "/" + cfg.Bucket
	}
	publicURL = strings.TrimRight(publicURL, "/")

	return &Client{
		s3Client:      s3Client,
		presignClient: s3.NewPresignClient(s3Client),
		bucket:        cfg.Bucket,
		publicURL:     publicURL,
		expiry:        time.Duration(cfg.PresignExpiry) * time.Second,
	}, nil
}

// PresignPut generates a presigned PUT URL for the given file.
func (c *Client) PresignPut(ctx context.Context, req model.PresignRequest) (model.PresignResult, error) {
	date := time.Now().UTC().Format("2006-01-02")
	id := uuid.New().String()
	key := fmt.Sprintf("caps/%s/%s/%s", date, id, req.Filename)

	presigned, err := c.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(c.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(req.ContentType),
	}, s3.WithPresignExpires(c.expiry))
	if err != nil {
		return model.PresignResult{}, fmt.Errorf("presign put: %w", err)
	}

	return model.PresignResult{
		UploadURL: presigned.URL,
		ObjectURL: fmt.Sprintf("%s/%s", c.publicURL, key),
		ObjectKey: key,
		ExpiresIn: int(c.expiry.Seconds()),
	}, nil
}

// Delete removes an object from the bucket by key.
func (c *Client) Delete(ctx context.Context, key string) error {
	_, err := c.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("delete object %s: %w", key, err)
	}

	return nil
}
