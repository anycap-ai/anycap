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
)

// Client generates presigned PUT URLs and manages objects using the S3-compatible API.
type Client struct {
	s3Client      *s3.Client
	presignClient *s3.PresignClient
	bucket        string
	putExpiry     time.Duration
	getExpiry     time.Duration
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

	return &Client{
		s3Client:      s3Client,
		presignClient: s3.NewPresignClient(s3Client),
		bucket:        cfg.Bucket,
		putExpiry:     time.Duration(cfg.PresignExpiry) * time.Second,
		getExpiry:     time.Duration(cfg.PresignGetExpiry) * time.Second,
	}, nil
}

func (c *Client) DeleteObject(ctx context.Context, objectKey string) error {
	_, err := c.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return fmt.Errorf("delete object %s: %w", objectKey, err)
	}

	return nil
}

func (c *Client) PresignPutObject(ctx context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error) {
	expiry := c.putExpiry
	if expiry <= 0 {
		expiry = 10 * time.Minute
	}
	presigned, err := c.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(c.bucket),
		Key:           aws.String(objectKey),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return model.PresignResult{}, fmt.Errorf("presign put object: %w", err)
	}

	return model.PresignResult{
		UploadURL: presigned.URL,
		ObjectURL: fmt.Sprintf("s3://%s/%s", c.bucket, objectKey),
		ObjectKey: objectKey,
		ExpiresIn: int(expiry.Seconds()),
	}, nil
}

func (c *Client) PresignGetObject(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
	if expiry <= 0 {
		expiry = c.getExpiry
		if expiry <= 0 {
			expiry = time.Hour
		}
	}
	presigned, err := c.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(objectKey),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("presign get object: %w", err)
	}
	return presigned.URL, nil
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

func (c *Client) BucketName() string {
	return c.bucket
}
