package s3store

import (
	"context"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// StubClient returns canned presign responses for local development without S3 credentials.
type StubClient struct{}

func NewStubClient() *StubClient {
	return &StubClient{}
}

func (c *StubClient) PresignPutObject(_ context.Context, objectKey, _ string, _ int64) (model.PresignResult, error) {
	return model.PresignResult{
		UploadURL: fmt.Sprintf("https://storage.stub.local/anycap-cloud/%s?X-Amz-Signature=stub", objectKey),
		ObjectURL: fmt.Sprintf("s3://anycap-cloud/%s", objectKey),
		ObjectKey: objectKey,
		ExpiresIn: 600,
	}, nil
}

func (c *StubClient) PresignGetObject(_ context.Context, objectKey string, _ time.Duration) (string, error) {
	return fmt.Sprintf("https://storage.stub.local/anycap-cloud/%s?X-Amz-Signature=stub-get", objectKey), nil
}

func (c *StubClient) HeadObject(_ context.Context, _ string) (*model.StorageObjectHead, error) {
	return &model.StorageObjectHead{
		Size: 1,
		MIME: "application/octet-stream",
		ETag: "stub-etag",
	}, nil
}

func (c *StubClient) CopyObject(_ context.Context, _, _ string) error {
	return nil
}

func (c *StubClient) DeleteObject(_ context.Context, _ string) error {
	return nil
}

func (c *StubClient) BucketName() string {
	return "anycap-cloud"
}
