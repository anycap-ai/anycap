//go:build ignore

// apply-lifecycle applies the R2 lifecycle configuration from deploy/r2-lifecycle.json.
// Usage: go run scripts/dev/apply-lifecycle.go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	endpoint := os.Getenv("S3_ENDPOINT")
	accessKey := os.Getenv("S3_ACCESS_KEY_ID")
	secretKey := os.Getenv("S3_SECRET_ACCESS_KEY")
	bucket := os.Getenv("S3_BUCKET")
	region := os.Getenv("S3_REGION")
	if region == "" {
		region = "auto"
	}

	if endpoint == "" || accessKey == "" || secretKey == "" || bucket == "" {
		log.Fatal("S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET must be set")
	}

	ctx := context.Background()

	resolver := aws.EndpointResolverWithOptionsFunc(
		func(service, r string, options ...any) (aws.Endpoint, error) {
			return aws.Endpoint{URL: endpoint}, nil
		},
	)

	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		),
		awsconfig.WithEndpointResolverWithOptions(resolver),
	)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	prefix := os.Getenv("S3_KEY_PREFIX")
	if prefix == "" {
		prefix = "user_upload"
	}
	filterPrefix := prefix + "/"

	rules := []types.LifecycleRule{
		{
			ID:     aws.String("expire-user-uploads-7d"),
			Status: types.ExpirationStatusEnabled,
			Filter: &types.LifecycleRuleFilter{Prefix: aws.String(filterPrefix)},
			Expiration: &types.LifecycleExpiration{
				Days: aws.Int32(7),
			},
		},
		{
			ID:     aws.String("abort-incomplete-multipart-1d"),
			Status: types.ExpirationStatusEnabled,
			Filter: &types.LifecycleRuleFilter{Prefix: aws.String(filterPrefix)},
			AbortIncompleteMultipartUpload: &types.AbortIncompleteMultipartUpload{
				DaysAfterInitiation: aws.Int32(1),
			},
		},
	}

	_, err = client.PutBucketLifecycleConfiguration(ctx, &s3.PutBucketLifecycleConfigurationInput{
		Bucket: aws.String(bucket),
		LifecycleConfiguration: &types.BucketLifecycleConfiguration{
			Rules: rules,
		},
	})
	if err != nil {
		log.Fatalf("put lifecycle: %v", err)
	}

	fmt.Printf("Lifecycle rules applied to bucket %q with prefix %q\n", bucket, filterPrefix)

	// Verify by reading back
	out, err := client.GetBucketLifecycleConfiguration(ctx, &s3.GetBucketLifecycleConfigurationInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		log.Printf("warning: could not verify lifecycle: %v", err)
		return
	}

	fmt.Printf("Verified %d rule(s):\n", len(out.Rules))
	for _, r := range out.Rules {
		fmt.Printf("  - %s (status=%s)\n", aws.ToString(r.ID), r.Status)
	}
}
