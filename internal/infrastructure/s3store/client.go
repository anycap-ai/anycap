package s3store

import (
	"context"
	"fmt"
	"net/url"
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
	keyPrefix     string
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
		keyPrefix:     cfg.KeyPrefix,
		expiry:        time.Duration(cfg.PresignExpiry) * time.Second,
	}, nil
}

// PresignPut generates a presigned PUT URL for the given file.
func (c *Client) PresignPut(ctx context.Context, req model.PresignRequest) (model.PresignResult, error) {
	date := time.Now().UTC().Format("2006-01-02")
	id := uuid.New().String()
	key := fmt.Sprintf("%s/%s/%s/%s", c.keyPrefix, date, id, req.Filename)

	presigned, err := c.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(c.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(req.ContentType),
		ContentLength: aws.Int64(req.ContentLength),
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

func (c *Client) PresignPutObject(ctx context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error) {
	presigned, err := c.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(c.bucket),
		Key:           aws.String(objectKey),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
	}, s3.WithPresignExpires(c.expiry))
	if err != nil {
		return model.PresignResult{}, fmt.Errorf("presign put object: %w", err)
	}

	return model.PresignResult{
		UploadURL: presigned.URL,
		ObjectURL: fmt.Sprintf("%s/%s", c.publicURL, objectKey),
		ObjectKey: objectKey,
		ExpiresIn: int(c.expiry.Seconds()),
	}, nil
}

func (c *Client) HeadObject(ctx context.Context, objectKey string) (*model.StorageObjectHead, error) {
	output, err := c.s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return nil, fmt.Errorf("head object %s: %w", objectKey, err)
	}

	head := &model.StorageObjectHead{
		Size: aws.ToInt64(output.ContentLength),
		MIME: strings.TrimSpace(aws.ToString(output.ContentType)),
		ETag: strings.Trim(aws.ToString(output.ETag), "\""),
	}
	return head, nil
}

func (c *Client) CopyObject(ctx context.Context, sourceObjectKey, targetObjectKey string) error {
	copySource := c.bucket + "/" + sourceObjectKey
	encodedCopySource := url.PathEscape(copySource)
	encodedCopySource = strings.ReplaceAll(encodedCopySource, "%2F", "/")

	_, err := c.s3Client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(c.bucket),
		CopySource: aws.String(encodedCopySource),
		Key:        aws.String(targetObjectKey),
	})
	if err != nil {
		return fmt.Errorf("copy object %s -> %s: %w", sourceObjectKey, targetObjectKey, err)
	}
	return nil
}

func (c *Client) DeleteObject(ctx context.Context, objectKey string) error {
	return c.Delete(ctx, objectKey)
}

func (c *Client) BucketName() string {
	return c.bucket
}
