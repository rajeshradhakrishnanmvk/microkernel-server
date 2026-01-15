Below is a **free-form, technical README** written as if this project were discovered by another engineer six months from now and they’re trying to understand *why it exists and how it works*.

No episode framing.
No storytelling gimmicks.
Just architecture, intent, and trade-offs.

You can drop this directly into `README.md`.

---

# Slop Architecture – Microkernel for AI Workloads

## Overview

This project explores a **microkernel-style architecture for AI workloads**, implemented using **vanilla JavaScript** concepts and executed across **browser and server boundaries**.

The core idea is simple:

> Treat AI not as application logic, but as **untrusted, supervised compute**.

Instead of embedding AI calls directly into UI or business logic, the system introduces a **microkernel** that:

* boots plugins
* executes them under supervision
* enforces timeouts
* isolates failures
* exposes explicit system state

The result is an execution model closer to an operating system than a typical web application.

---

## Why a Microkernel for AI?

AI systems violate many assumptions of traditional software:

* execution time is unpredictable
* failures are non-deterministic
* APIs change rapidly
* responses are probabilistic
* cost and latency are externalized

Embedding AI directly into application code hides these realities.

A microkernel **forces them into the open**.

In this design:

* AI is just another plugin
* plugins can fail independently
* the kernel survives plugin failure
* failure is a *state*, not an exception

---

## Architectural Principles

### 1. Kernel Minimalism

The kernel is intentionally small. It knows how to:

* register plugins
* initialize them
* execute them
* enforce execution boundaries
* track status

It does **not** know:

* what the plugin does
* whether it is “AI”
* whether it talks to a network
* whether it is safe or correct

This separation is deliberate.

---

### 2. Plugins Are Untrusted

Every plugin is treated as hostile by default.

A plugin can:

* crash during initialization
* throw during execution
* never return
* consume unbounded time

The kernel handles each case explicitly.

Typical plugin states:

* `REGISTERED`
* `ACTIVE`
* `CRASHED_ON_LOAD`
* `CRASHED_RUNTIME`
* `QUARANTINED`

This mirrors how real systems classify failure.

---

### 3. Execution Is Supervised

Plugin execution is wrapped in:

* promise normalization
* execution timeouts
* failure detection
* quarantine on non-termination

This is not defensive coding.
This is **policy enforcement**.

If a plugin does not return within its time budget, it is removed from service.

---

### 4. Browser Is a Console, Not a Runtime

Early experiments attempted to run AI plugins directly in the browser.

This failed for valid reasons:

* SDKs are not browser-global
* secrets cannot be protected
* load order is nondeterministic
* execution cannot be preempted safely

Rather than working around this, the architecture accepts the constraint:

> **The browser is a control surface, not a trust boundary.**

The browser UI issues commands.
The kernel executes them elsewhere.

---

### 5. Server-Side Kernel Execution

The kernel runs in Node.js, hosted in a reproducible environment using **GitHub Codespaces** and a **devcontainer**.

Benefits:

* secure handling of API keys
* deterministic runtime
* ability to terminate misbehaving plugins
* clean separation between UI and execution

The browser communicates with the kernel via HTTP, similar to system calls.

---

## System Components

### Microkernel

Responsibilities:

* plugin lifecycle management
* execution supervision
* state reporting

Non-responsibilities:

* business logic
* AI logic
* UI rendering
* retries or heuristics

This keeps the kernel stable as the system evolves.

---

### Plugins

Plugins encapsulate behavior.

Examples:

* LLM plugin (OpenAI)
* Logger plugin
* Rogue / infinite plugin (for testing supervision)

Each plugin exposes:

* optional `init()`
* mandatory `execute()`

Plugins do not communicate with each other.
All coordination flows through the kernel.

---

### Browser UI

The UI is intentionally minimal.

It provides:

* kernel boot
* plugin execution
* rogue plugin triggering
* system status inspection

The UI has **no knowledge** of AI, timeouts, or failure handling.

It simply displays what the kernel reports.

---

## Failure as a First-Class Concept

Most applications treat failure as an edge case.

This system treats failure as a **core operating condition**.

Examples:

* A plugin that never resolves is quarantined
* A plugin that crashes on load is blocked permanently
* A plugin that fails during execution is marked unstable
* The kernel remains operational throughout

This mirrors how operating systems, databases, and distributed systems survive in production.

---

## What This Is Not

This project is not:

* a framework
* an AI wrapper
* a UI demo
* a chatbot
* a production-ready system

It is an **architectural experiment**.

Its value lies in making failure visible, explicit, and survivable.

---

## Intended Audience

This project is useful for:

* engineers designing AI-heavy systems
* architects thinking about AI reliability
* teams integrating multiple AI providers
* anyone tired of embedding AI calls directly into application code

---

## Possible Extensions

The architecture naturally supports:

* plugin budgets
* retry policies
* circuit breakers
* plugin prioritization
* distributed kernels
* multiple AI providers
* observability and tracing

Crucially, these can be added **without changing the UI**.

---

## Final Thought

AI systems are not unreliable because they are new.

They are unreliable because we treat them as libraries instead of **processes**.

This project explores what happens when we stop doing that.

The answer is not perfection.

The answer is survivability.
