package credit

import (
	"context"
	"testing"
)

func TestCreditStub_GetBalance(t *testing.T) {
	client := NewStubClient(map[string]int64{"user-1": 5})

	balance, err := client.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 5 {
		t.Fatalf("expected balance 5, got %d", balance.Available)
	}
}

func TestCreditStub_DeductIsIdempotent(t *testing.T) {
	client := NewStubClient(map[string]int64{"user-1": 5})

	if err := client.Deduct(context.Background(), "user-1", 2, "image.generate", "req-1"); err != nil {
		t.Fatalf("first Deduct() error = %v", err)
	}
	if err := client.Deduct(context.Background(), "user-1", 2, "image.generate", "req-1"); err != nil {
		t.Fatalf("second Deduct() error = %v", err)
	}

	balance, err := client.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 3 {
		t.Fatalf("expected balance 3 after idempotent deduct, got %d", balance.Available)
	}
}

func TestCreditStub_DeductZeroAmountIsNoOp(t *testing.T) {
	client := NewStubClient(map[string]int64{"user-1": 5})

	if err := client.Deduct(context.Background(), "user-1", 0, "image.generate", "req-1"); err != nil {
		t.Fatalf("Deduct() error = %v", err)
	}

	balance, err := client.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 5 {
		t.Fatalf("expected balance 5 after zero deduct, got %d", balance.Available)
	}

	transactions, total, err := client.ListTransactions(context.Background(), "user-1", 10, 0)
	if err != nil {
		t.Fatalf("ListTransactions() error = %v", err)
	}
	if total != 0 || len(transactions) != 0 {
		t.Fatalf("expected no transactions after zero deduct, got total=%d items=%#v", total, transactions)
	}
}
