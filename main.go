package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"golang.org/x/net/html"
)

// extractText recursively traverses an HTML node tree and extracts all text content.
func extractText(n *html.Node) string {
	if n.Type == html.TextNode {
		// Trim space to avoid printing lots of whitespace
		return strings.TrimSpace(n.Data)
	}

	if n.Type == html.ElementNode && (n.Data == "script" || n.Data == "style") {
		// Do not traverse into script or style tags
		return ""
	}

	var result string
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		text := extractText(c)
		if text != "" {
			result += text + " " // Add a space between text blocks for readability
		}
	}
	return strings.TrimSpace(result)
}

func main() {
	// Check if a URL was provided on the command line
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <URL>\n", os.Args[0])
		os.Exit(1)
	}
	url := os.Args[1]

	resp, err := http.Get(url)
	if err != nil {
		fmt.Println("Error fetching URL:", err)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	doc, err := html.Parse(strings.NewReader(string(body)))
	if err != nil {
		fmt.Println("Error parsing HTML:", err)
		return
	}

	textContent := extractText(doc)
	fmt.Println(textContent)
}
