const { app } = require("@azure/functions");
const { checkAdmin } = require("./shared");

const QUESTION_BANK = [
  // --- Compute ---
  {
    question: "Which Azure service lets you run containers without managing VMs or orchestrators, scaling to zero when idle?",
    options: ["Azure Kubernetes Service", "Container Instances", "Container Apps", "Azure Batch"],
    correctAnswer: "Container Apps"
  },
  {
    question: "Which Azure compute service is best for running short-lived, event-driven code without provisioning infrastructure?",
    options: ["Azure App Service", "Azure Functions", "Azure Batch", "Virtual Machines"],
    correctAnswer: "Azure Functions"
  },
  {
    question: "What does a Virtual Machine Scale Set (VMSS) provide that a single VM does not?",
    options: ["Managed OS patching", "Automatic horizontal scaling based on demand", "Built-in container orchestration", "Serverless billing model"],
    correctAnswer: "Automatic horizontal scaling based on demand"
  },
  {
    question: "Which Azure service provides fully managed Kubernetes cluster orchestration?",
    options: ["Azure Container Instances", "Azure Kubernetes Service (AKS)", "Service Fabric", "Azure Red Hat OpenShift"],
    correctAnswer: "Azure Kubernetes Service (AKS)"
  },
  {
    question: "Azure App Service supports deployment slots. What is the primary benefit of using them?",
    options: ["Reduced compute cost", "Zero-downtime deployments with swap capability", "Automatic database migrations", "Built-in CI/CD pipelines"],
    correctAnswer: "Zero-downtime deployments with swap capability"
  },
  // --- Networking ---
  {
    question: "Which Azure service provides a global Layer 7 load balancer with WAF, SSL offload, and CDN integration?",
    options: ["Azure Load Balancer", "Application Gateway", "Azure Front Door", "Traffic Manager"],
    correctAnswer: "Azure Front Door"
  },
  {
    question: "What is the purpose of Azure Private Link?",
    options: ["Encrypt VNet-to-VNet traffic", "Access Azure PaaS services over a private endpoint in your VNet", "Create site-to-site VPN tunnels", "Monitor network traffic flow"],
    correctAnswer: "Access Azure PaaS services over a private endpoint in your VNet"
  },
  {
    question: "Which Azure networking service operates at Layer 4 (TCP/UDP) and distributes traffic within a region?",
    options: ["Azure Front Door", "Application Gateway", "Azure Load Balancer", "Traffic Manager"],
    correctAnswer: "Azure Load Balancer"
  },
  {
    question: "Azure ExpressRoute provides what type of connectivity to Azure?",
    options: ["VPN over public internet", "Dedicated private connection bypassing the public internet", "Peer-to-peer mesh networking", "Software-defined WAN"],
    correctAnswer: "Dedicated private connection bypassing the public internet"
  },
  {
    question: "What does Azure Bastion provide?",
    options: ["DDoS protection for VNets", "Secure RDP/SSH access to VMs without exposing public IPs", "DNS resolution for private endpoints", "Network packet inspection"],
    correctAnswer: "Secure RDP/SSH access to VMs without exposing public IPs"
  },
  // --- Identity & Security ---
  {
    question: "What is the primary purpose of Azure Key Vault?",
    options: ["Store application logs", "Manage secrets, keys, and certificates centrally", "Authenticate users with MFA", "Scan code for vulnerabilities"],
    correctAnswer: "Manage secrets, keys, and certificates centrally"
  },
  {
    question: "What does Managed Identity in Azure eliminate the need for?",
    options: ["Azure subscriptions", "Storing credentials in code or config to access Azure resources", "Resource groups", "Virtual networks"],
    correctAnswer: "Storing credentials in code or config to access Azure resources"
  },
  {
    question: "Microsoft Defender for Cloud provides which capability?",
    options: ["Container orchestration", "Cloud security posture management and threat protection", "DNS zone hosting", "Cost management recommendations"],
    correctAnswer: "Cloud security posture management and threat protection"
  },
  {
    question: "Microsoft Sentinel is classified as what type of security solution?",
    options: ["Firewall-as-a-Service", "Cloud-native SIEM and SOAR", "Identity provider", "Endpoint detection and response"],
    correctAnswer: "Cloud-native SIEM and SOAR"
  },
  {
    question: "What is the difference between a system-assigned and user-assigned Managed Identity?",
    options: ["System-assigned costs more", "System-assigned is tied to one resource lifecycle; user-assigned can be shared across resources", "User-assigned requires Key Vault", "There is no difference"],
    correctAnswer: "System-assigned is tied to one resource lifecycle; user-assigned can be shared across resources"
  },
  // --- Databases ---
  {
    question: "Azure Cosmos DB is best described as which type of database?",
    options: ["Relational SQL database", "Globally distributed, multi-model NoSQL database", "In-memory cache", "Graph-only database"],
    correctAnswer: "Globally distributed, multi-model NoSQL database"
  },
  {
    question: "What consistency model does Cosmos DB offer that provides the strongest guarantee?",
    options: ["Eventual", "Session", "Strong", "Bounded Staleness"],
    correctAnswer: "Strong"
  },
  {
    question: "Azure SQL Database serverless tier automatically does what when the database is idle?",
    options: ["Deletes the database", "Pauses compute and only charges for storage", "Switches to a free tier", "Migrates to Cosmos DB"],
    correctAnswer: "Pauses compute and only charges for storage"
  },
  {
    question: "Which Azure caching service is commonly used to improve application performance by storing frequently accessed data in memory?",
    options: ["Azure Cosmos DB", "Azure Redis Cache", "Azure Table Storage", "Azure Data Lake"],
    correctAnswer: "Azure Redis Cache"
  },
  {
    question: "Azure Database for PostgreSQL Flexible Server supports which high-availability configuration?",
    options: ["Active-active multi-region", "Zone-redundant with automatic failover", "Manual backup and restore only", "Read replicas as primary failover"],
    correctAnswer: "Zone-redundant with automatic failover"
  },
  // --- Storage ---
  {
    question: "What Azure Storage redundancy option replicates data across three availability zones in the primary region?",
    options: ["LRS (Locally Redundant)", "ZRS (Zone-Redundant)", "GRS (Geo-Redundant)", "GZRS (Geo-Zone-Redundant)"],
    correctAnswer: "ZRS (Zone-Redundant)"
  },
  {
    question: "Azure Data Lake Storage Gen2 combines the capabilities of which two services?",
    options: ["Cosmos DB and SQL Database", "Blob Storage and a Hadoop-compatible file system", "Azure Files and Azure Disks", "Table Storage and Queue Storage"],
    correctAnswer: "Blob Storage and a Hadoop-compatible file system"
  },
  {
    question: "Which Azure Storage access tier is the cheapest for storing data but has the highest retrieval cost?",
    options: ["Hot", "Cool", "Cold", "Archive"],
    correctAnswer: "Archive"
  },
  // --- Management & Governance ---
  {
    question: "Azure Policy is used to do what?",
    options: ["Deploy resources automatically", "Enforce organizational standards and assess compliance at scale", "Monitor application performance", "Manage user identities"],
    correctAnswer: "Enforce organizational standards and assess compliance at scale"
  },
  {
    question: "What does Azure Monitor's Application Insights primarily track?",
    options: ["Network traffic between VNets", "Application performance, exceptions, and user telemetry", "Azure billing and cost trends", "DNS resolution times"],
    correctAnswer: "Application performance, exceptions, and user telemetry"
  },
  {
    question: "Azure Advisor provides recommendations in which categories?",
    options: ["Security only", "Cost, Security, Reliability, Operational Excellence, and Performance", "Networking and Storage only", "Compute and Database only"],
    correctAnswer: "Cost, Security, Reliability, Operational Excellence, and Performance"
  },
  {
    question: "What is the purpose of Azure Resource Manager (ARM) templates?",
    options: ["Monitor resource health", "Define infrastructure as code for repeatable deployments", "Manage user access control", "Back up virtual machines"],
    correctAnswer: "Define infrastructure as code for repeatable deployments"
  },
  // --- Integration ---
  {
    question: "Azure API Management provides which key capability?",
    options: ["Hosting web applications", "A gateway to publish, secure, and manage APIs with rate limiting and analytics", "Serverless function execution", "Container orchestration"],
    correctAnswer: "A gateway to publish, secure, and manage APIs with rate limiting and analytics"
  },
  {
    question: "Azure Service Bus is best suited for which messaging pattern?",
    options: ["Simple HTTP webhooks", "Enterprise messaging with queues, topics, and guaranteed delivery", "Real-time video streaming", "File transfer between storage accounts"],
    correctAnswer: "Enterprise messaging with queues, topics, and guaranteed delivery"
  },
  {
    question: "What is the key difference between Azure Event Grid and Azure Event Hubs?",
    options: ["Event Grid is for big data streaming; Event Hubs is for discrete events", "Event Grid is for reactive event routing; Event Hubs is for high-throughput data streaming", "They are the same service with different names", "Event Hubs only works with IoT devices"],
    correctAnswer: "Event Grid is for reactive event routing; Event Hubs is for high-throughput data streaming"
  },
  {
    question: "Azure Logic Apps is best described as what?",
    options: ["A container orchestration platform", "A low-code workflow automation service for integrating apps and data", "A serverless compute engine", "A message queuing service"],
    correctAnswer: "A low-code workflow automation service for integrating apps and data"
  },
  // --- AI + Analytics ---
  {
    question: "Azure AI Search (formerly Cognitive Search) provides which capability?",
    options: ["Training custom ML models", "AI-powered full-text search with semantic ranking over your data", "Real-time speech translation", "Automated code generation"],
    correctAnswer: "AI-powered full-text search with semantic ranking over your data"
  },
  {
    question: "Microsoft Fabric unifies which data workloads into a single platform?",
    options: ["Only data warehousing", "Data engineering, data science, real-time analytics, and BI", "Only machine learning", "Only ETL pipelines"],
    correctAnswer: "Data engineering, data science, real-time analytics, and BI"
  },
  {
    question: "Azure Data Factory is primarily used for what?",
    options: ["Hosting web APIs", "Orchestrating and automating data movement and transformation (ETL/ELT)", "Running machine learning training jobs", "Managing Kubernetes clusters"],
    correctAnswer: "Orchestrating and automating data movement and transformation (ETL/ELT)"
  },
  // --- DevOps & Development ---
  {
    question: "Azure Container Registry (ACR) is used to do what?",
    options: ["Run containers in production", "Store and manage private Docker container images", "Orchestrate container deployments", "Build container networking"],
    correctAnswer: "Store and manage private Docker container images"
  },
  {
    question: "What does Azure DevTest Labs provide?",
    options: ["Production-grade VM hosting", "Self-service lab environments with cost controls and auto-shutdown", "CI/CD pipeline management", "Source code repositories"],
    correctAnswer: "Self-service lab environments with cost controls and auto-shutdown"
  },
  {
    question: "Azure App Configuration is used for what purpose?",
    options: ["Storing database connection strings only", "Centrally managing application settings and feature flags", "Deploying applications", "Monitoring app performance"],
    correctAnswer: "Centrally managing application settings and feature flags"
  },
  // --- Migration & Hybrid ---
  {
    question: "Azure Arc enables what capability?",
    options: ["Faster VM boot times", "Managing on-premises and multi-cloud resources through the Azure control plane", "Free Azure subscriptions", "Automated code deployment"],
    correctAnswer: "Managing on-premises and multi-cloud resources through the Azure control plane"
  },
  {
    question: "Azure Site Recovery provides which disaster recovery capability?",
    options: ["Database backup only", "Replication and automated failover of VMs to a secondary Azure region", "Network traffic analysis", "Cost optimization"],
    correctAnswer: "Replication and automated failover of VMs to a secondary Azure region"
  },
  {
    question: "Azure Migrate is used to do what?",
    options: ["Create new Azure subscriptions", "Discover, assess, and migrate on-premises workloads to Azure", "Monitor cloud costs", "Manage DNS records"],
    correctAnswer: "Discover, assess, and migrate on-premises workloads to Azure"
  },
  // --- IoT ---
  {
    question: "Azure IoT Hub provides what core functionality?",
    options: ["Web application hosting", "Bi-directional communication between IoT devices and the cloud at scale", "SQL database management", "Container orchestration"],
    correctAnswer: "Bi-directional communication between IoT devices and the cloud at scale"
  },
  // --- 50 MORE QUESTIONS ---
  // Compute deep-dive
  {
    question: "What is the maximum number of vCPUs in a single Azure VM (Mv2-series)?",
    options: ["64", "128", "416", "208"],
    correctAnswer: "416"
  },
  {
    question: "Azure Container Instances (ACI) is best suited for which scenario?",
    options: ["Long-running production microservices", "Quick burst compute for short-lived containers", "Managing Kubernetes clusters", "Running Windows desktop applications"],
    correctAnswer: "Quick burst compute for short-lived containers"
  },
  {
    question: "What does Azure Spot VMs offer compared to regular VMs?",
    options: ["Higher SLA guarantees", "Deeply discounted pricing with possible eviction", "Dedicated hardware isolation", "Faster network throughput"],
    correctAnswer: "Deeply discounted pricing with possible eviction"
  },
  {
    question: "Azure Service Fabric is primarily used for what?",
    options: ["DNS management", "Building and managing scalable microservices and stateful applications", "Object storage", "Email delivery"],
    correctAnswer: "Building and managing scalable microservices and stateful applications"
  },
  {
    question: "What Azure compute feature lets you run code in response to a timer schedule without any infrastructure?",
    options: ["Azure Batch", "Azure Functions Timer Trigger", "Azure Automation Runbook", "VM Scale Set auto-scale"],
    correctAnswer: "Azure Functions Timer Trigger"
  },
  // Networking deep-dive
  {
    question: "What is an Azure Network Security Group (NSG) used for?",
    options: ["Load balancing traffic", "Filtering network traffic with allow/deny rules based on IP, port, and protocol", "Establishing VPN tunnels", "DNS resolution"],
    correctAnswer: "Filtering network traffic with allow/deny rules based on IP, port, and protocol"
  },
  {
    question: "Azure Virtual WAN provides what capability?",
    options: ["Container orchestration", "Unified hub-and-spoke networking with automated branch connectivity", "Database replication", "CDN caching"],
    correctAnswer: "Unified hub-and-spoke networking with automated branch connectivity"
  },
  {
    question: "What does Azure Traffic Manager use to route DNS traffic?",
    options: ["Layer 7 HTTP inspection", "DNS-based traffic routing with methods like Priority, Weighted, and Geographic", "BGP peering", "Packet-level load balancing"],
    correctAnswer: "DNS-based traffic routing with methods like Priority, Weighted, and Geographic"
  },
  {
    question: "What is the purpose of Azure DDoS Protection Standard?",
    options: ["Encrypts data at rest", "Provides adaptive tuning and mitigation of volumetric DDoS attacks on VNet resources", "Blocks SQL injection attacks", "Manages SSL certificates"],
    correctAnswer: "Provides adaptive tuning and mitigation of volumetric DDoS attacks on VNet resources"
  },
  {
    question: "Azure Application Gateway operates at which OSI layer?",
    options: ["Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)", "Layer 2 (Data Link)"],
    correctAnswer: "Layer 7 (Application)"
  },
  // Security deep-dive
  {
    question: "Azure Firewall is a managed cloud-based firewall operating at which layers?",
    options: ["Layer 3 only", "Layers 3 through 7 (Network through Application)", "Layer 7 only", "Layer 4 only"],
    correctAnswer: "Layers 3 through 7 (Network through Application)"
  },
  {
    question: "What is the purpose of Microsoft Entra Conditional Access?",
    options: ["Encrypting storage accounts", "Enforcing access policies based on conditions like user, device, location, and risk", "Managing Kubernetes RBAC", "DNS zone management"],
    correctAnswer: "Enforcing access policies based on conditions like user, device, location, and risk"
  },
  {
    question: "Azure Dedicated HSM provides what?",
    options: ["Managed Kubernetes", "FIPS 140-2 Level 3 validated hardware security modules for cryptographic key storage", "Container image scanning", "DDoS protection"],
    correctAnswer: "FIPS 140-2 Level 3 validated hardware security modules for cryptographic key storage"
  },
  {
    question: "What does Microsoft Defender for Cloud's Secure Score measure?",
    options: ["Application performance", "Your security posture as a percentage based on implemented recommendations", "Database query efficiency", "Network latency"],
    correctAnswer: "Your security posture as a percentage based on implemented recommendations"
  },
  {
    question: "Azure Private DNS Zones are used for what?",
    options: ["Public domain registration", "Name resolution for resources within a virtual network without internet exposure", "CDN endpoint configuration", "Email routing"],
    correctAnswer: "Name resolution for resources within a virtual network without internet exposure"
  },
  // Storage deep-dive
  {
    question: "Azure Blob Storage supports which three access tiers?",
    options: ["Standard, Premium, Ultra", "Hot, Cool, Archive", "Basic, General, Premium", "Fast, Slow, Offline"],
    correctAnswer: "Hot, Cool, Archive"
  },
  {
    question: "What is Azure Files primarily used for?",
    options: ["Object storage for unstructured data", "Fully managed SMB/NFS file shares accessible from cloud and on-premises", "Time-series database storage", "Graph database storage"],
    correctAnswer: "Fully managed SMB/NFS file shares accessible from cloud and on-premises"
  },
  {
    question: "Azure Managed Disks automatically handle what for VM storage?",
    options: ["Data encryption at rest and storage account management", "Automatic data compression", "Cross-region replication", "Built-in backup scheduling"],
    correctAnswer: "Data encryption at rest and storage account management"
  },
  {
    question: "What protocol does Azure Queue Storage use for messaging?",
    options: ["AMQP", "HTTP/HTTPS REST API", "MQTT", "gRPC"],
    correctAnswer: "HTTP/HTTPS REST API"
  },
  {
    question: "Azure Storage immutability policies support which compliance standard?",
    options: ["PCI DSS only", "SEC 17a-4(f), CFTC, and FINRA for WORM (Write Once, Read Many) storage", "HIPAA only", "SOX only"],
    correctAnswer: "SEC 17a-4(f), CFTC, and FINRA for WORM (Write Once, Read Many) storage"
  },
  // Database deep-dive
  {
    question: "Azure Cosmos DB supports which consistency levels? (Select the strongest)",
    options: ["Eventual → Session → Strong", "Strong → Bounded Staleness → Session → Consistent Prefix → Eventual", "Read Committed → Serializable", "Weak → Medium → Strong"],
    correctAnswer: "Strong → Bounded Staleness → Session → Consistent Prefix → Eventual"
  },
  {
    question: "Azure SQL Managed Instance differs from Azure SQL Database by providing what?",
    options: ["Cheaper pricing", "Near 100% compatibility with on-premises SQL Server including cross-database queries", "Built-in machine learning", "NoSQL capabilities"],
    correctAnswer: "Near 100% compatibility with on-premises SQL Server including cross-database queries"
  },
  {
    question: "What is the Request Unit (RU) in Azure Cosmos DB?",
    options: ["A billing currency for Azure subscriptions", "A normalized measure of throughput cost for database operations", "A network bandwidth metric", "A storage capacity unit"],
    correctAnswer: "A normalized measure of throughput cost for database operations"
  },
  {
    question: "Azure Database for MySQL Flexible Server supports which deployment option for high availability?",
    options: ["Active-active multi-master", "Same-zone and zone-redundant HA with automatic failover", "Manual backup restore only", "Read-only geo-replicas only"],
    correctAnswer: "Same-zone and zone-redundant HA with automatic failover"
  },
  {
    question: "What is the maximum size of a single Azure SQL Database?",
    options: ["1 TB", "4 TB", "100 TB (Hyperscale tier)", "500 GB"],
    correctAnswer: "100 TB (Hyperscale tier)"
  },
  // DevOps & Development
  {
    question: "Azure DevOps includes which core services?",
    options: ["Only CI/CD pipelines", "Boards, Repos, Pipelines, Test Plans, and Artifacts", "Only source control", "Only project management"],
    correctAnswer: "Boards, Repos, Pipelines, Test Plans, and Artifacts"
  },
  {
    question: "Microsoft Dev Box provides developers with what?",
    options: ["Free Azure credits", "Self-service, cloud-based workstations preconfigured for specific projects", "Automated code reviews", "Container runtime environments"],
    correctAnswer: "Self-service, cloud-based workstations preconfigured for specific projects"
  },
  {
    question: "Azure Deployment Environments allows teams to do what?",
    options: ["Monitor production applications", "Quickly spin up templated infrastructure environments for dev/test with governance", "Manage DNS records", "Create virtual networks"],
    correctAnswer: "Quickly spin up templated infrastructure environments for dev/test with governance"
  },
  {
    question: "What is the purpose of Azure Artifacts in Azure DevOps?",
    options: ["Storing VM images", "Hosting package feeds for NuGet, npm, Maven, and Python packages", "Running CI/CD pipelines", "Managing work items"],
    correctAnswer: "Hosting package feeds for NuGet, npm, Maven, and Python packages"
  },
  {
    question: "Azure Load Testing is based on which open-source tool?",
    options: ["Locust", "Apache JMeter", "Gatling", "k6"],
    correctAnswer: "Apache JMeter"
  },
  // Management & Governance deep-dive
  {
    question: "Azure Resource Graph enables what capability?",
    options: ["Deploying ARM templates", "Querying resources at scale across subscriptions using Kusto Query Language", "Managing user identities", "Creating virtual networks"],
    correctAnswer: "Querying resources at scale across subscriptions using Kusto Query Language"
  },
  {
    question: "What is the difference between Azure Policy and Azure RBAC?",
    options: ["They are the same thing", "Policy enforces resource property rules; RBAC controls who can perform actions", "RBAC enforces compliance; Policy controls access", "Policy is for networking; RBAC is for storage"],
    correctAnswer: "Policy enforces resource property rules; RBAC controls who can perform actions"
  },
  {
    question: "Azure Cost Management + Billing provides which key feature?",
    options: ["Automatic resource deployment", "Cost analysis, budgets, alerts, and recommendations to optimize spending", "Source code management", "Container orchestration"],
    correctAnswer: "Cost analysis, budgets, alerts, and recommendations to optimize spending"
  },
  {
    question: "Azure Lighthouse enables what for service providers?",
    options: ["Free hosting", "Cross-tenant management of customer Azure resources with delegated access", "Automated CI/CD pipelines", "IoT device management"],
    correctAnswer: "Cross-tenant management of customer Azure resources with delegated access"
  },
  {
    question: "What does Azure Update Manager do?",
    options: ["Updates Azure portal UI", "Manages OS and software updates across Azure and hybrid VMs at scale", "Updates DNS records", "Updates container images"],
    correctAnswer: "Manages OS and software updates across Azure and hybrid VMs at scale"
  },
  // Integration deep-dive
  {
    question: "Azure Event Hubs can ingest how many events per second?",
    options: ["Thousands", "Millions", "Hundreds", "Tens of thousands"],
    correctAnswer: "Millions"
  },
  {
    question: "Azure Service Bus supports which messaging patterns?",
    options: ["Only point-to-point queues", "Queues (point-to-point) and Topics/Subscriptions (publish-subscribe)", "Only pub-sub", "Only event streaming"],
    correctAnswer: "Queues (point-to-point) and Topics/Subscriptions (publish-subscribe)"
  },
  {
    question: "What is the purpose of Azure SignalR Service?",
    options: ["Batch data processing", "Adding real-time web functionality like live updates and push notifications", "Database replication", "Container orchestration"],
    correctAnswer: "Adding real-time web functionality like live updates and push notifications"
  },
  {
    question: "Azure Web PubSub is optimized for which communication pattern?",
    options: ["Email delivery", "Real-time bidirectional messaging using WebSocket connections at scale", "File transfer", "Database synchronization"],
    correctAnswer: "Real-time bidirectional messaging using WebSocket connections at scale"
  },
  {
    question: "Azure Notification Hubs is used to do what?",
    options: ["Send SMS messages", "Push notifications to any platform (iOS, Android, Windows) at scale from any backend", "Manage email campaigns", "Monitor application health"],
    correctAnswer: "Push notifications to any platform (iOS, Android, Windows) at scale from any backend"
  },
  // AI & ML deep-dive
  {
    question: "Azure OpenAI Service provides access to which models?",
    options: ["Only BERT models", "GPT-4, GPT-4o, DALL·E, and Whisper models with enterprise security", "Only image generation models", "Only speech recognition models"],
    correctAnswer: "GPT-4, GPT-4o, DALL·E, and Whisper models with enterprise security"
  },
  {
    question: "Azure Machine Learning supports which MLOps capability?",
    options: ["Only model training", "End-to-end ML lifecycle: data prep, training, deployment, monitoring, and automated retraining", "Only model serving", "Only data labeling"],
    correctAnswer: "End-to-end ML lifecycle: data prep, training, deployment, monitoring, and automated retraining"
  },
  {
    question: "Azure AI Document Intelligence (formerly Form Recognizer) does what?",
    options: ["Generates documents from templates", "Extracts text, key-value pairs, and tables from documents using AI", "Translates documents between languages", "Compresses PDF files"],
    correctAnswer: "Extracts text, key-value pairs, and tables from documents using AI"
  },
  {
    question: "What is the purpose of Azure AI Content Safety?",
    options: ["Encrypting content at rest", "Detecting harmful content including hate, violence, and self-harm in text and images", "Compressing media files", "Managing content licenses"],
    correctAnswer: "Detecting harmful content including hate, violence, and self-harm in text and images"
  },
  {
    question: "Azure Databricks is a collaboration between Microsoft and which company?",
    options: ["Google", "Databricks (Apache Spark creators)", "Snowflake", "Cloudera"],
    correctAnswer: "Databricks (Apache Spark creators)"
  },
  // Monitoring & Observability
  {
    question: "Azure Monitor Log Analytics uses which query language?",
    options: ["SQL", "Kusto Query Language (KQL)", "GraphQL", "MongoDB Query Language"],
    correctAnswer: "Kusto Query Language (KQL)"
  },
  {
    question: "Azure Managed Grafana provides what?",
    options: ["Container orchestration", "Fully managed Grafana dashboards for visualizing Azure Monitor and other data sources", "Database management", "CI/CD pipelines"],
    correctAnswer: "Fully managed Grafana dashboards for visualizing Azure Monitor and other data sources"
  },
  {
    question: "What is the difference between Azure Monitor Metrics and Logs?",
    options: ["They are the same thing", "Metrics are lightweight numeric time-series; Logs are rich structured data queried with KQL", "Metrics are for VMs only; Logs are for apps only", "Logs are real-time; Metrics are batch"],
    correctAnswer: "Metrics are lightweight numeric time-series; Logs are rich structured data queried with KQL"
  },
  {
    question: "Azure Chaos Studio helps teams with what practice?",
    options: ["Cost optimization", "Chaos engineering — deliberately injecting faults to test resilience", "Performance benchmarking", "Security auditing"],
    correctAnswer: "Chaos engineering — deliberately injecting faults to test resilience"
  },
  {
    question: "What SLA does Azure guarantee for a single VM with Premium SSD managed disks?",
    options: ["99.0%", "99.9%", "99.95%", "99.99%"],
    correctAnswer: "99.9%"
  }
];

let usedIndices = new Set();

app.http("generateQuestion", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "manage/generate",
  handler: async (request, context) => {
    try {
      const authError = checkAdmin(request);
      if (authError) return authError;

      // Reset pool if all questions have been used
      if (usedIndices.size >= QUESTION_BANK.length) {
        usedIndices.clear();
      }

      // Pick a random unused question
      let idx;
      do {
        idx = Math.floor(Math.random() * QUESTION_BANK.length);
      } while (usedIndices.has(idx));

      usedIndices.add(idx);
      const q = QUESTION_BANK[idx];

      return {
        jsonBody: {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          remaining: QUESTION_BANK.length - usedIndices.size,
        },
      };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: "Internal server error" } };
    }
  },
});
