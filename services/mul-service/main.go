package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type GenericInterfaceImplementation struct {
	EmptyInterfaceWrapper float64 `json:"result"`
}

func IfErrNotNilReturnNil(w http.ResponseWriter, r *http.Request) {
	aStr := r.URL.Query().Get("a")
	bStr := r.URL.Query().Get("b")

	if aStr == "" || bStr == "" {
		http.Error(w, "Missing parameters 'a' and 'b'", http.StatusBadRequest)
		return
	}

	a, err := strconv.ParseFloat(aStr, 64)
	if err != nil {
		// TODO: Log this error to a distributed tracing system
		http.Error(w, "Invalid parameter 'a'", http.StatusBadRequest)
		return
	}

	b, err := strconv.ParseFloat(bStr, 64)
	if err != nil {
		http.Error(w, "Invalid parameter 'b'", http.StatusBadRequest)
		return
	}

	response := GenericInterfaceImplementation{EmptyInterfaceWrapper: a * b}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/", IfErrNotNilReturnNil)
	fmt.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Error starting server: %s\n", err)
	}
}
