const NS = "http://www.w3.org/2000/svg";
const ROUTE_COLORS = {
  teal: "#0f766e",
  blue: "#2563eb",
  amber: "#d97706",
  violet: "#7c3aed",
  rose: "#db2777",
  slate: "#475569",
  red: "#d14343"
};

const patterns = [
  {
    id: "content-router",
    name: "Content-Based Router",
    summary: "Routes each message to a service based on payload attributes.",
    useCase:
      "When one inbound stream must be dispatched to specialized processors, e.g., orders routed by region, risk, or priority.",
    pros: [
      "Centralizes routing logic",
      "Easy to add new destinations with new rules",
      "Keeps producers unaware of consumer topology"
    ],
    cons: [
      "Routing rule complexity can grow quickly",
      "Single router can become a bottleneck",
      "Harder end-to-end tracing without observability"
    ],
    products: [
      "Apache Camel (ContentBasedRouter EIP)",
      "Spring Integration",
      "Apache Kafka + Kafka Streams",
      "Redpanda + stream processors"
    ],
    graph: {
      nodes: [
        { id: "producer", label: "Order API", x: 60, y: 170 },
        { id: "router", label: "Router", x: 260, y: 170 },
        { id: "fraud", label: "Fraud Service", x: 500, y: 60 },
        { id: "billing", label: "Billing Service", x: 500, y: 170 },
        { id: "analytics", label: "Analytics", x: 500, y: 280 },
        { id: "sink", label: "Ack Queue", x: 760, y: 170 }
      ],
      links: [
        ["producer", "router"],
        ["router", "fraud"],
        ["router", "billing"],
        ["router", "analytics"],
        ["fraud", "sink"],
        ["billing", "sink"],
        ["analytics", "sink"]
      ]
    },
    generatePackets() {
      const paths = [
        { route: ["producer", "router", "fraud", "sink"], color: ROUTE_COLORS.violet },
        { route: ["producer", "router", "billing", "sink"], color: ROUTE_COLORS.blue },
        { route: ["producer", "router", "analytics", "sink"], color: ROUTE_COLORS.teal }
      ];
      return [paths[Math.floor(Math.random() * paths.length)]];
    }
  },
  {
    id: "publish-subscribe",
    name: "Publish-Subscribe Channel",
    summary: "A published message fan-outs to many subscribers asynchronously.",
    useCase:
      "When multiple independent consumers need the same event, like order-created events used by notifications, analytics, and fulfillment.",
    pros: [
      "Loose coupling between producer and consumers",
      "Scales well with many independent subscribers",
      "Supports event-driven architectures"
    ],
    cons: [
      "Event ordering and duplicate handling need care",
      "Schema evolution requires discipline",
      "Harder to reason about full processing lifecycle"
    ],
    products: [
      "Apache Kafka",
      "RabbitMQ (topic/fanout exchanges)",
      "NATS",
      "Apache Pulsar"
    ],
    graph: {
      nodes: [
        { id: "pub", label: "Publisher", x: 50, y: 170 },
        { id: "topic", label: "Topic/Broker", x: 290, y: 170 },
        { id: "sub1", label: "Email", x: 560, y: 70 },
        { id: "sub2", label: "Warehouse", x: 560, y: 170 },
        { id: "sub3", label: "Data Lake", x: 560, y: 270 },
        { id: "done", label: "Processed", x: 780, y: 170 }
      ],
      links: [
        ["pub", "topic"],
        ["topic", "sub1"],
        ["topic", "sub2"],
        ["topic", "sub3"],
        ["sub1", "done"],
        ["sub2", "done"],
        ["sub3", "done"]
      ]
    },
    generatePackets() {
      return [
        { route: ["pub", "topic", "sub1", "done"], color: ROUTE_COLORS.rose },
        { route: ["pub", "topic", "sub2", "done"], color: ROUTE_COLORS.blue },
        { route: ["pub", "topic", "sub3", "done"], color: ROUTE_COLORS.teal }
      ];
    }
  },
  {
    id: "message-filter",
    name: "Message Filter",
    summary: "Drops or forwards messages based on eligibility rules.",
    useCase:
      "When only a subset of inbound traffic should continue, such as filtering invalid events before expensive processing.",
    pros: [
      "Reduces unnecessary downstream load",
      "Can enforce policy and validation at boundaries",
      "Simple control point for noisy streams"
    ],
    cons: [
      "Risk of accidental data loss from bad rules",
      "Requires transparent audit logging",
      "Can hide producer quality issues"
    ],
    products: [
      "Apache Camel (Filter EIP)",
      "Spring Cloud Stream",
      "ksqlDB",
      "Apache Flink"
    ],
    graph: {
      nodes: [
        { id: "source", label: "Source Queue", x: 60, y: 170 },
        { id: "filter", label: "Validation Filter", x: 310, y: 170 },
        { id: "target", label: "Processing Service", x: 570, y: 100 },
        { id: "drop", label: "Dead Letter", x: 570, y: 260 },
        { id: "done", label: "Done", x: 790, y: 100 }
      ],
      links: [
        ["source", "filter"],
        ["filter", "target"],
        ["target", "done"],
        ["filter", "drop"]
      ]
    },
    generatePackets() {
      const pass = Math.random() > 0.35;
      if (pass) return [{ route: ["source", "filter", "target", "done"] }];
      return [{ route: ["source", "filter", "drop"], color: "#d14343", dropped: true }];
    }
  },
  {
    id: "aggregator",
    name: "Aggregator",
    summary: "Combines correlated messages into a single consolidated result.",
    useCase:
      "When one request fans out to several services and responses must be merged into one business document.",
    pros: [
      "Supports parallel downstream execution",
      "Produces complete views from fragmented data",
      "Flexible completion rules (count, time, condition)"
    ],
    cons: [
      "Needs correlation IDs and state management",
      "Timeout policy is hard to tune",
      "Memory pressure if many groups stay open"
    ],
    products: [
      "Apache Camel (Splitter + Aggregator)",
      "Spring Integration Aggregator",
      "Akka Streams",
      "Apache NiFi"
    ],
    graph: {
      nodes: [
        { id: "req", label: "Order Request", x: 40, y: 170 },
        { id: "split", label: "Splitter", x: 220, y: 170 },
        { id: "inv", label: "Inventory", x: 430, y: 70 },
        { id: "ship", label: "Shipping", x: 430, y: 170 },
        { id: "tax", label: "Tax", x: 430, y: 270 },
        { id: "agg", label: "Aggregator", x: 640, y: 170 },
        { id: "reply", label: "Combined Reply", x: 810, y: 170 }
      ],
      links: [
        ["req", "split"],
        ["split", "inv"],
        ["split", "ship"],
        ["split", "tax"],
        ["inv", "agg"],
        ["ship", "agg"],
        ["tax", "agg"],
        ["agg", "reply"]
      ]
    },
    generatePackets() {
      return [
        { route: ["req", "split", "inv", "agg", "reply"], color: ROUTE_COLORS.blue },
        { route: ["req", "split", "ship", "agg", "reply"], color: ROUTE_COLORS.violet },
        { route: ["req", "split", "tax", "agg", "reply"], color: ROUTE_COLORS.amber }
      ];
    }
  },
  {
    id: "recipient-list",
    name: "Recipient List",
    summary: "Sends a message to a computed list of recipients at runtime.",
    useCase:
      "When the list of target systems is dynamic, such as routing alerts to teams based on tenant, severity, or policy.",
    pros: [
      "Dynamic recipient selection per message",
      "Keeps sender free of endpoint details",
      "Easy to extend with new recipients"
    ],
    cons: [
      "Can amplify traffic unexpectedly",
      "Recipient calculation logic can become complex",
      "Needs observability to track fan-out behavior"
    ],
    products: [
      "Apache Camel (Recipient List EIP)",
      "Spring Integration",
      "MuleSoft Anypoint",
      "Apache NiFi"
    ],
    graph: {
      nodes: [
        { id: "source", label: "Alert Source", x: 50, y: 170 },
        { id: "list", label: "Recipient List", x: 250, y: 170 },
        { id: "ops", label: "Ops Team", x: 500, y: 70 },
        { id: "sec", label: "Security Team", x: 500, y: 170 },
        { id: "acct", label: "Account Team", x: 500, y: 270 },
        { id: "done", label: "Delivered", x: 760, y: 170 }
      ],
      links: [
        ["source", "list"],
        ["list", "ops"],
        ["list", "sec"],
        ["list", "acct"],
        ["ops", "done"],
        ["sec", "done"],
        ["acct", "done"]
      ]
    },
    generatePackets() {
      const candidates = [
        { route: ["source", "list", "ops", "done"], color: ROUTE_COLORS.violet },
        { route: ["source", "list", "sec", "done"], color: ROUTE_COLORS.red },
        { route: ["source", "list", "acct", "done"], color: ROUTE_COLORS.teal }
      ];
      const selected = candidates.filter(() => Math.random() > 0.25);
      return selected.length ? selected : [candidates[Math.floor(Math.random() * candidates.length)]];
    }
  },
  {
    id: "resequencer",
    name: "Resequencer",
    summary: "Reorders out-of-sequence messages before forwarding downstream.",
    useCase:
      "When network retries or parallel producers cause sequence gaps and consumers require strict order.",
    pros: [
      "Restores ordered processing",
      "Shields consumers from transport jitter",
      "Improves downstream determinism"
    ],
    cons: [
      "Adds buffering and latency",
      "Needs timeout strategy for missing events",
      "State growth must be controlled"
    ],
    products: [
      "Apache Camel (Resequencer EIP)",
      "Spring Integration",
      "Apache Flink",
      "Kafka Streams"
    ],
    graph: {
      nodes: [
        { id: "in", label: "Event Stream", x: 60, y: 170 },
        { id: "reseq", label: "Resequencer", x: 300, y: 170 },
        { id: "ordered", label: "Ordered Stream", x: 560, y: 170 },
        { id: "consumer", label: "Consumer", x: 780, y: 170 }
      ],
      links: [
        ["in", "reseq"],
        ["reseq", "ordered"],
        ["ordered", "consumer"]
      ]
    },
    generatePackets() {
      return [
        { route: ["in", "reseq", "ordered", "consumer"], color: ROUTE_COLORS.rose },
        { route: ["in", "reseq", "ordered", "consumer"], color: ROUTE_COLORS.blue },
        { route: ["in", "reseq", "ordered", "consumer"], color: ROUTE_COLORS.teal }
      ];
    }
  },
  {
    id: "wire-tap",
    name: "Wire Tap",
    summary: "Copies messages to a side channel without impacting the main flow.",
    useCase:
      "When you need non-intrusive audit, debugging, or analytics alongside production processing.",
    pros: [
      "Adds observability with low coupling",
      "Keeps primary path unchanged",
      "Useful for auditing and diagnostics"
    ],
    cons: [
      "Extra traffic and storage costs",
      "Sensitive data may need masking",
      "Tap failures still require handling policy"
    ],
    products: [
      "Apache Camel (Wire Tap EIP)",
      "Spring Integration",
      "Kafka Mirror topics",
      "OpenTelemetry collectors"
    ],
    graph: {
      nodes: [
        { id: "src", label: "Order Stream", x: 50, y: 170 },
        { id: "tap", label: "Wire Tap", x: 260, y: 170 },
        { id: "main", label: "Main Processor", x: 520, y: 120 },
        { id: "audit", label: "Audit Pipeline", x: 520, y: 270 },
        { id: "done", label: "Completed", x: 780, y: 120 }
      ],
      links: [
        ["src", "tap"],
        ["tap", "main"],
        ["main", "done"],
        ["tap", "audit"]
      ]
    },
    generatePackets() {
      return [
        { route: ["src", "tap", "main", "done"], color: ROUTE_COLORS.teal },
        { route: ["src", "tap", "audit"], color: ROUTE_COLORS.slate }
      ];
    }
  },
  {
    id: "dead-letter-channel",
    name: "Dead Letter Channel",
    summary: "Moves messages that repeatedly fail processing into a quarantine channel.",
    useCase:
      "When transient and permanent failures must be separated so poison messages do not block healthy traffic.",
    pros: [
      "Prevents endless retry loops",
      "Improves operational visibility for failures",
      "Keeps main pipeline flowing"
    ],
    cons: [
      "Needs investigation and replay workflow",
      "Can hide systemic issues if ignored",
      "Requires retention and access controls"
    ],
    products: [
      "RabbitMQ dead-letter exchanges",
      "Amazon SQS DLQ",
      "Apache Kafka retry + DLQ topics",
      "Azure Service Bus dead-letter queue"
    ],
    graph: {
      nodes: [
        { id: "in", label: "Input Queue", x: 60, y: 170 },
        { id: "proc", label: "Processor", x: 300, y: 170 },
        { id: "ok", label: "Success Queue", x: 560, y: 110 },
        { id: "dlq", label: "Dead Letter Queue", x: 560, y: 250 },
        { id: "ops", label: "Ops Review", x: 790, y: 250 }
      ],
      links: [
        ["in", "proc"],
        ["proc", "ok"],
        ["proc", "dlq"],
        ["dlq", "ops"]
      ]
    },
    generatePackets() {
      const success = Math.random() > 0.35;
      if (success) return [{ route: ["in", "proc", "ok"], color: ROUTE_COLORS.teal }];
      return [{ route: ["in", "proc", "dlq", "ops"], color: ROUTE_COLORS.red, dropped: true }];
    }
  },
  {
    id: "splitter",
    name: "Splitter",
    summary: "Breaks one composite message into many smaller messages for parallel handling.",
    useCase:
      "When batch payloads must be processed per item, such as line items, records, or files inside archives.",
    pros: [
      "Enables parallel processing",
      "Improves isolation of item failures",
      "Supports fine-grained scaling"
    ],
    cons: [
      "Needs aggregation or tracking downstream",
      "Can increase message volume significantly",
      "Correlation IDs become mandatory"
    ],
    products: [
      "Apache Camel (Splitter EIP)",
      "Spring Integration",
      "Apache NiFi",
      "Apache Flink"
    ],
    graph: {
      nodes: [
        { id: "batch", label: "Batch Input", x: 50, y: 170 },
        { id: "split", label: "Splitter", x: 260, y: 170 },
        { id: "a", label: "Item Worker A", x: 520, y: 80 },
        { id: "b", label: "Item Worker B", x: 520, y: 170 },
        { id: "c", label: "Item Worker C", x: 520, y: 260 },
        { id: "done", label: "Results", x: 780, y: 170 }
      ],
      links: [
        ["batch", "split"],
        ["split", "a"],
        ["split", "b"],
        ["split", "c"],
        ["a", "done"],
        ["b", "done"],
        ["c", "done"]
      ]
    },
    generatePackets() {
      return [
        { route: ["batch", "split", "a", "done"], color: ROUTE_COLORS.blue },
        { route: ["batch", "split", "b", "done"], color: ROUTE_COLORS.violet },
        { route: ["batch", "split", "c", "done"], color: ROUTE_COLORS.teal }
      ];
    }
  },
  {
    id: "claim-check",
    name: "Claim Check",
    summary: "Stores large payloads externally and passes a lightweight reference through the flow.",
    useCase:
      "When message size limits or transport costs require offloading heavy blobs while preserving processing context.",
    pros: [
      "Reduces broker payload size",
      "Improves transport efficiency",
      "Keeps events lightweight"
    ],
    cons: [
      "Adds external storage dependency",
      "Reference lifecycle must be managed",
      "Extra hop can increase latency"
    ],
    products: [
      "Apache Camel (Claim Check EIP)",
      "AWS S3 + SNS/SQS",
      "Google Cloud Storage + Pub/Sub",
      "Azure Blob Storage + Service Bus"
    ],
    graph: {
      nodes: [
        { id: "src", label: "Uploader", x: 50, y: 170 },
        { id: "store", label: "Blob Store", x: 300, y: 90 },
        { id: "ref", label: "Claim Token", x: 300, y: 250 },
        { id: "worker", label: "Worker", x: 560, y: 170 },
        { id: "done", label: "Processed", x: 800, y: 170 }
      ],
      links: [
        ["src", "store"],
        ["src", "ref"],
        ["ref", "worker"],
        ["store", "worker"],
        ["worker", "done"]
      ]
    },
    generatePackets() {
      return [
        { route: ["src", "store", "worker", "done"], color: ROUTE_COLORS.slate },
        { route: ["src", "ref", "worker", "done"], color: ROUTE_COLORS.amber }
      ];
    }
  },
  {
    id: "message-translator",
    name: "Message Translator",
    summary: "Transforms message formats between producer and consumer contracts.",
    useCase:
      "When integrating systems with incompatible schemas, protocols, or field conventions.",
    pros: [
      "Decouples producer and consumer formats",
      "Allows gradual schema evolution",
      "Centralizes transformation rules"
    ],
    cons: [
      "Mapping logic can become brittle",
      "Potential data loss in lossy transforms",
      "Needs strong contract tests"
    ],
    products: [
      "Apache Camel (Message Translator EIP)",
      "MuleSoft DataWeave",
      "Spring Integration transformers",
      "Kafka Streams"
    ],
    graph: {
      nodes: [
        { id: "erp", label: "Legacy ERP XML", x: 50, y: 170 },
        { id: "xform", label: "Translator", x: 310, y: 170 },
        { id: "api", label: "Modern JSON API", x: 580, y: 170 },
        { id: "sink", label: "Consumer", x: 800, y: 170 }
      ],
      links: [
        ["erp", "xform"],
        ["xform", "api"],
        ["api", "sink"]
      ]
    },
    generatePackets() {
      return [{ route: ["erp", "xform", "api", "sink"], color: ROUTE_COLORS.blue }];
    }
  },
  {
    id: "idempotent-receiver",
    name: "Idempotent Receiver",
    summary: "Detects and safely ignores duplicate messages.",
    useCase:
      "When at-least-once delivery can produce duplicates and downstream effects must remain exactly-once.",
    pros: [
      "Prevents duplicate side effects",
      "Improves reliability with retries",
      "Works well with event-driven systems"
    ],
    cons: [
      "Requires deduplication state store",
      "Key selection must be stable and correct",
      "State retention policy needs tuning"
    ],
    products: [
      "Apache Camel (Idempotent Consumer EIP)",
      "Kafka Streams state stores",
      "Redis-backed dedup filters",
      "Spring Integration metadata store"
    ],
    graph: {
      nodes: [
        { id: "broker", label: "Broker", x: 60, y: 170 },
        { id: "idem", label: "Idempotent Check", x: 320, y: 170 },
        { id: "proc", label: "Business Processor", x: 580, y: 110 },
        { id: "dupe", label: "Duplicate Sink", x: 580, y: 250 },
        { id: "done", label: "Committed", x: 800, y: 110 }
      ],
      links: [
        ["broker", "idem"],
        ["idem", "proc"],
        ["proc", "done"],
        ["idem", "dupe"]
      ]
    },
    generatePackets() {
      const duplicate = Math.random() > 0.65;
      if (duplicate) return [{ route: ["broker", "idem", "dupe"], color: ROUTE_COLORS.red, dropped: true }];
      return [{ route: ["broker", "idem", "proc", "done"], color: ROUTE_COLORS.teal }];
    }
  },
  {
    id: "request-reply",
    name: "Request-Reply",
    summary: "Sends a request message and waits for a correlated response.",
    useCase:
      "When workflows need synchronous-style outcomes over messaging infrastructure.",
    pros: [
      "Supports conversational integration",
      "Preserves loose coupling over transport",
      "Correlation IDs make tracing explicit"
    ],
    cons: [
      "Can reduce throughput under high latency",
      "Timeout handling must be explicit",
      "Not ideal for fire-and-forget workloads"
    ],
    products: [
      "RabbitMQ RPC pattern",
      "Apache Camel (Request-Reply EIP)",
      "NATS request/reply",
      "Spring Integration gateways"
    ],
    graph: {
      nodes: [
        { id: "client", label: "Client", x: 70, y: 170 },
        { id: "reqq", label: "Request Queue", x: 290, y: 120 },
        { id: "svc", label: "Service", x: 540, y: 120 },
        { id: "repq", label: "Reply Queue", x: 290, y: 250 },
        { id: "done", label: "Client Reply", x: 780, y: 170 }
      ],
      links: [
        ["client", "reqq"],
        ["reqq", "svc"],
        ["svc", "repq"],
        ["repq", "done"]
      ]
    },
    generatePackets() {
      return [
        { route: ["client", "reqq", "svc", "repq", "done"], color: ROUTE_COLORS.violet }
      ];
    }
  },
  {
    id: "competing-consumers",
    name: "Competing Consumers",
    summary: "Multiple consumers pull from the same queue to scale processing throughput.",
    useCase:
      "When a single consumer cannot keep up with queue depth and work items are independently processable.",
    pros: [
      "Horizontal throughput scaling",
      "Simple operational model",
      "Natural load balancing by queue"
    ],
    cons: [
      "Ordering guarantees may be weaker",
      "Hot partitions can still bottleneck",
      "Needs idempotency for retries"
    ],
    products: [
      "RabbitMQ worker queues",
      "Amazon SQS + Lambda",
      "Azure Service Bus competing consumers",
      "Kafka consumer groups"
    ],
    graph: {
      nodes: [
        { id: "queue", label: "Work Queue", x: 70, y: 170 },
        { id: "w1", label: "Worker 1", x: 380, y: 70 },
        { id: "w2", label: "Worker 2", x: 380, y: 170 },
        { id: "w3", label: "Worker 3", x: 380, y: 270 },
        { id: "done", label: "Completed", x: 760, y: 170 }
      ],
      links: [
        ["queue", "w1"],
        ["queue", "w2"],
        ["queue", "w3"],
        ["w1", "done"],
        ["w2", "done"],
        ["w3", "done"]
      ]
    },
    generatePackets() {
      const workers = [
        { route: ["queue", "w1", "done"], color: ROUTE_COLORS.blue },
        { route: ["queue", "w2", "done"], color: ROUTE_COLORS.teal },
        { route: ["queue", "w3", "done"], color: ROUTE_COLORS.amber }
      ];
      return [workers[Math.floor(Math.random() * workers.length)]];
    }
  },
  {
    id: "message-store",
    name: "Message Store",
    summary: "Persists messages durably so they can be recovered, replayed, or audited.",
    useCase:
      "When reliability and replay are required for compliance, diagnostics, or backfilling downstream systems.",
    pros: [
      "Improves durability and recoverability",
      "Supports replay and audit trails",
      "Helps troubleshoot integration incidents"
    ],
    cons: [
      "Storage and retention costs",
      "Replay safeguards are required",
      "Schema migrations affect historical events"
    ],
    products: [
      "Kafka log topics",
      "EventStoreDB",
      "Apache Pulsar durable topics",
      "NATS JetStream"
    ],
    graph: {
      nodes: [
        { id: "prod", label: "Producer", x: 60, y: 170 },
        { id: "store", label: "Message Store", x: 320, y: 170 },
        { id: "live", label: "Live Consumer", x: 600, y: 110 },
        { id: "replay", label: "Replay Consumer", x: 600, y: 250 },
        { id: "done", label: "Outputs", x: 810, y: 170 }
      ],
      links: [
        ["prod", "store"],
        ["store", "live"],
        ["store", "replay"],
        ["live", "done"],
        ["replay", "done"]
      ]
    },
    generatePackets() {
      return [
        { route: ["prod", "store", "live", "done"], color: ROUTE_COLORS.teal },
        { route: ["prod", "store", "replay", "done"], color: ROUTE_COLORS.slate }
      ];
    }
  },
  {
    id: "saga",
    name: "Saga (Orchestration)",
    summary: "Coordinates distributed steps with compensating actions on failure.",
    useCase:
      "When a transaction spans multiple microservices and a traditional distributed ACID transaction is not practical.",
    pros: [
      "Improves resilience for distributed workflows",
      "Enables explicit compensation strategy",
      "Works well with service autonomy"
    ],
    cons: [
      "Compensations can be complex to model",
      "Eventually consistent by design",
      "Needs strong idempotency guarantees"
    ],
    products: [
      "Temporal",
      "Camunda",
      "Netflix Conductor",
      "Axon Framework"
    ],
    graph: {
      nodes: [
        { id: "client", label: "Checkout API", x: 40, y: 170 },
        { id: "orch", label: "Saga Orchestrator", x: 250, y: 170 },
        { id: "pay", label: "Payment", x: 470, y: 70 },
        { id: "inv", label: "Inventory", x: 470, y: 170 },
        { id: "ship", label: "Shipping", x: 470, y: 270 },
        { id: "comp", label: "Compensation", x: 700, y: 270 },
        { id: "ok", label: "Response", x: 810, y: 170 }
      ],
      links: [
        ["client", "orch"],
        ["orch", "pay"],
        ["pay", "inv"],
        ["inv", "ship"],
        ["ship", "ok"],
        ["inv", "comp"],
        ["pay", "comp"],
        ["comp", "ok"]
      ]
    },
    generatePackets() {
      const success = Math.random() > 0.3;
      if (success) {
        return [{ route: ["client", "orch", "pay", "inv", "ship", "ok"], color: ROUTE_COLORS.teal }];
      }
      return [
        { route: ["client", "orch", "pay", "inv", "comp", "ok"], color: ROUTE_COLORS.red }
      ];
    }
  }
];

const state = {
  selectedId: patterns[0].id,
  running: false,
  rate: 3,
  packets: [],
  sent: 0,
  processed: 0,
  totalLatency: 0,
  lastTick: performance.now(),
  trafficTimer: null
};

const el = {
  patternSelect: document.getElementById("patternSelect"),
  trafficRate: document.getElementById("trafficRate"),
  rateLabel: document.getElementById("rateLabel"),
  startTraffic: document.getElementById("startTraffic"),
  stopTraffic: document.getElementById("stopTraffic"),
  singleStep: document.getElementById("singleStep"),
  patternCards: document.getElementById("patternCards"),
  simTitle: document.getElementById("simTitle"),
  simSummary: document.getElementById("simSummary"),
  simSvg: document.getElementById("simSvg"),
  sentCount: document.getElementById("sentCount"),
  processedCount: document.getElementById("processedCount"),
  latencyAvg: document.getElementById("latencyAvg"),
  useCase: document.getElementById("useCase"),
  pros: document.getElementById("pros"),
  cons: document.getElementById("cons"),
  products: document.getElementById("products")
};

function getPattern() {
  return patterns.find((p) => p.id === state.selectedId);
}

function setPattern(id) {
  state.selectedId = id;
  state.packets = [];
  state.sent = 0;
  state.processed = 0;
  state.totalLatency = 0;
  renderPatternCards();
  renderDetails();
  drawGraph();
  updateStats();
}

function renderPatternCards() {
  el.patternCards.innerHTML = "";
  patterns.forEach((p) => {
    const card = document.createElement("article");
    card.className = `pattern-card ${p.id === state.selectedId ? "active" : ""}`;
    card.innerHTML = `<h3>${p.name}</h3><p>${p.summary}</p>`;
    card.addEventListener("click", () => {
      el.patternSelect.value = p.id;
      setPattern(p.id);
    });
    el.patternCards.appendChild(card);
  });
}

function renderList(target, values) {
  target.innerHTML = "";
  values.forEach((value) => {
    const li = document.createElement("li");
    li.textContent = value;
    target.appendChild(li);
  });
}

function renderDetails() {
  const p = getPattern();
  el.simTitle.textContent = `${p.name} Simulation`;
  el.simSummary.textContent = p.summary;
  el.useCase.textContent = p.useCase;
  renderList(el.pros, p.pros);
  renderList(el.cons, p.cons);
  renderList(el.products, p.products);
}

function makeSvg(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, String(v)));
  return n;
}

function drawGraph() {
  const p = getPattern();
  const svg = el.simSvg;
  svg.innerHTML = "";

  const defs = makeSvg("defs", {});
  const marker = makeSvg("marker", {
    id: "arrow",
    markerWidth: 10,
    markerHeight: 10,
    refX: 9,
    refY: 3,
    orient: "auto",
    markerUnits: "strokeWidth"
  });
  marker.appendChild(makeSvg("path", { d: "M0,0 L0,6 L9,3 z", fill: "#8fb5c0" }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const nodesById = Object.fromEntries(p.graph.nodes.map((n) => [n.id, n]));

  p.graph.links.forEach(([from, to]) => {
    const a = nodesById[from];
    const b = nodesById[to];
    const line = makeSvg("line", {
      class: "link",
      x1: a.x + 70,
      y1: a.y + 24,
      x2: b.x + 70,
      y2: b.y + 24
    });
    svg.appendChild(line);
  });

  p.graph.nodes.forEach((node) => {
    const g = makeSvg("g", { class: "node", "data-node": node.id });
    g.appendChild(makeSvg("rect", { x: node.x, y: node.y, width: 140, height: 48 }));
    const t = makeSvg("text", { x: node.x + 70, y: node.y + 29, "text-anchor": "middle" });
    t.textContent = node.label;
    g.appendChild(t);
    svg.appendChild(g);
  });
}

function spawnMessage() {
  const p = getPattern();
  const generated = p.generatePackets();
  const now = performance.now();
  state.sent += 1;

  generated.forEach((pkt) => {
    state.packets.push({
      route: pkt.route,
      color: pkt.color || ROUTE_COLORS.amber,
      dropped: Boolean(pkt.dropped),
      segment: 0,
      progress: 0,
      createdAt: now,
      speed: 0.4 + Math.random() * 0.45
    });
  });

  updateStats();
}

function stepPackets(deltaMs) {
  const p = getPattern();
  const nodesById = Object.fromEntries(p.graph.nodes.map((n) => [n.id, n]));
  state.packets.forEach((pkt) => {
    pkt.progress += pkt.speed * (deltaMs / 16.6) * 0.01;
    while (pkt.progress >= 1 && pkt.segment < pkt.route.length - 1) {
      pkt.progress -= 1;
      pkt.segment += 1;
    }
  });

  for (let i = state.packets.length - 1; i >= 0; i -= 1) {
    const pkt = state.packets[i];
    if (pkt.segment >= pkt.route.length - 1) {
      if (!pkt.dropped) {
        state.processed += 1;
        state.totalLatency += performance.now() - pkt.createdAt;
      }
      state.packets.splice(i, 1);
    }
  }

  renderPackets(nodesById);
  updateStats();
}

function renderPackets(nodesById) {
  el.simSvg.querySelectorAll(".packet").forEach((n) => n.remove());
  state.packets.forEach((pkt) => {
    const from = nodesById[pkt.route[pkt.segment]];
    const to = nodesById[pkt.route[Math.min(pkt.segment + 1, pkt.route.length - 1)]];
    if (!from || !to) return;
    const x = from.x + 70 + (to.x + 70 - (from.x + 70)) * pkt.progress;
    const y = from.y + 24 + (to.y + 24 - (from.y + 24)) * pkt.progress;
    const c = makeSvg("circle", {
      class: "packet",
      cx: x,
      cy: y,
      r: 7,
      fill: pkt.color
    });
    el.simSvg.appendChild(c);
  });
}

function updateStats() {
  el.sentCount.textContent = String(state.sent);
  el.processedCount.textContent = String(state.processed);
  const avg = state.processed ? Math.round(state.totalLatency / state.processed) : 0;
  el.latencyAvg.textContent = `${avg} ms`;
}

function startTraffic() {
  stopTraffic();
  state.running = true;
  const interval = Math.max(120, Math.floor(1000 / state.rate));
  state.trafficTimer = setInterval(spawnMessage, interval);
}

function stopTraffic() {
  state.running = false;
  if (state.trafficTimer) {
    clearInterval(state.trafficTimer);
    state.trafficTimer = null;
  }
}

function loop(now) {
  const delta = now - state.lastTick;
  state.lastTick = now;
  stepPackets(delta);
  requestAnimationFrame(loop);
}

function initControls() {
  patterns.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    el.patternSelect.appendChild(opt);
  });

  el.patternSelect.addEventListener("change", (e) => setPattern(e.target.value));
  el.trafficRate.addEventListener("input", (e) => {
    state.rate = Number(e.target.value);
    el.rateLabel.textContent = `${state.rate} msg/s`;
    if (state.running) startTraffic();
  });

  el.startTraffic.addEventListener("click", startTraffic);
  el.stopTraffic.addEventListener("click", stopTraffic);
  el.singleStep.addEventListener("click", spawnMessage);

  el.patternSelect.value = state.selectedId;
}

initControls();
renderPatternCards();
renderDetails();
drawGraph();
updateStats();
requestAnimationFrame(loop);
