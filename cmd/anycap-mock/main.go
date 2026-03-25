// anycap-mock starts a lightweight mock auth server for manual CLI testing.
//
// Usage:
//
//	go run ./cmd/anycap-mock
//
// Then in another terminal:
//
//	go run ./cmd/anycap --endpoint http://localhost:9999 login             # localhost callback (opens browser)
//	go run ./cmd/anycap --endpoint http://localhost:9999 login --headless  # device code (no browser)
//	go run ./cmd/anycap --endpoint http://localhost:9999 status            # check connection
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/testutil/mockserver"
)

func main() {
	addr := ":9999"
	if v := os.Getenv("MOCK_ADDR"); v != "" {
		addr = v
	}

	ms := mockserver.New()

	fmt.Println("AnyCap Mock Auth Server")
	fmt.Printf("Listening on http://localhost%s\n\n", addr)
	fmt.Println("Test commands:")
	fmt.Printf("  go run ./cmd/anycap --endpoint http://localhost%s login             # auto (localhost callback)\n", addr)
	fmt.Printf("  go run ./cmd/anycap --endpoint http://localhost%s login --headless  # device code flow\n", addr)
	fmt.Printf("  go run ./cmd/anycap --endpoint http://localhost%s status            # connectivity check\n", addr)
	fmt.Println()

	log.Fatal(http.ListenAndServe(addr, ms))
}
