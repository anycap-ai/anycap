# panics

Panic recovery utility with logging.

```go
import "gitlab.knoffice.tech/open/common-go/panics"
```

## Usage

```go
func riskyOperation(ctx context.Context) {
	defer panics.Catch(ctx)

	// Code that might panic
	panic("something went wrong")
}
```

## Behavior

- Recovers from panic
- Logs error with stack trace via `logging.WithContext()`
- Returns `true` if panic was caught, `false` otherwise

## Example with Return Value

```go
func safeOperation(ctx context.Context) (result string, err error) {
	defer func() {
		if panics.Catch(ctx) {
			err = errors.New("operation panicked")
		}
	}()

	// Risky code
	return "success", nil
}
```
