package s3store

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// StubClient returns canned presign responses for local development without S3 credentials.
type StubClient struct{}

func NewStubClient() *StubClient {
	return &StubClient{}
}

func (c *StubClient) PresignPut(_ context.Context, req model.PresignRequest) (model.PresignResult, error) {
	key := fmt.Sprintf("user_upload/stub-date/stub-id/%s", req.Filename)
	return model.PresignResult{
		UploadURL: fmt.Sprintf("https://storage.stub.local/anycap-tmp/%s?X-Amz-Signature=stub", key),
		ObjectURL: fmt.Sprintf("https://cdn.stub.local/%s", key),
		ObjectKey: key,
		ExpiresIn: 600,
	}, nil
}

func (c *StubClient) Delete(_ context.Context, _ string) error {
	return nil
}
