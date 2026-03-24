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
	return model.PresignResult{
		UploadURL: fmt.Sprintf("https://storage.stub.local/anycap-tmp/caps/stub-id/%s?X-Amz-Signature=stub", req.Filename),
		ObjectURL: fmt.Sprintf("https://cdn.stub.local/caps/stub-id/%s", req.Filename),
		ExpiresIn: 3600,
	}, nil
}
