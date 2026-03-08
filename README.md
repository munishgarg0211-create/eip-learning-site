# Enterprise Integration Patterns Learning Website

Interactive single-page website to learn Enterprise Integration Patterns with:

- Pattern selector and quick cards
- Animated visual message flow between dummy services
- Color-coded routed messages for clearer path visibility
- Adjustable traffic generation (continuous or single-message)
- Pattern notes: use case, pros, cons
- Open source products/libraries for each pattern

## Run

Open `index.html` directly in a browser, or run a local static server:

```bash
cd eip-learning-site
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Included Patterns

- Content-Based Router
- Publish-Subscribe Channel
- Message Filter
- Aggregator
- Recipient List
- Resequencer
- Wire Tap
- Dead Letter Channel
- Splitter
- Claim Check
- Message Translator
- Idempotent Receiver
- Request-Reply
- Competing Consumers
- Message Store
- Saga (Orchestration)
