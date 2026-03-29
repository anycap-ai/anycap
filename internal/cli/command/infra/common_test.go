package infra

import "testing"

func TestPageURLFromPageName_UsesCustomHostSuffix(t *testing.T) {
	t.Setenv("ANYCAP_PAGE_HOST_SUFFIX", "page.dev.anycap.cloud")

	got := pageURLFromPageName("Site-AbC1234")
	want := "https://site-abc1234.page.dev.anycap.cloud"
	if got != want {
		t.Fatalf("unexpected page url: got=%q want=%q", got, want)
	}
}
