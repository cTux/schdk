# Potential improvements

This document preserves evidence-backed solutions that could become valuable
after the current implementation reaches a measurable scale or quality limit.
Entries are not commitments. Implement one only when its activation conditions
are observed.

## OpenAI Vector Store

### Why it may be needed

The current question database can shortlist similar questions locally by
normalized answers and lexical token overlap. This is inexpensive and
provider-neutral, but it can miss a deeply paraphrased question that shares few
words with the original. An OpenAI Vector Store provides hosted semantic search
over uploaded question records and can retrieve conceptually related questions
for author-driven personal database search.

### Possible design

- Upload one compact text record per question containing its package ID,
  question number, question text, main answer, and alternative answers.
- Keep the Vector Store ID in account-scoped Google Drive app data.
- Synchronize changed or deleted records from the canonical `.schdk` package
  index.
- Search the store from the author's database query and return only the
  highest-ranked matches.
- Keep `.schdk` packages and the Drive question index as the source of truth;
  the Vector Store remains a rebuildable search projection.

### Benefits

- Finds paraphrases and related clue structures that lexical overlap can miss.
- Avoids sending the complete question database in each generation request.
- Moves vector indexing, storage, and nearest-neighbor search out of the
  browser and Electron renderer.
- Scales better when a user's database contains tens or hundreds of thousands
  of questions.

### Costs and constraints

- Works only with OpenAI and would make similarity quality provider-dependent
  while SCHDK also supports Anthropic and Google.
- Uploads question and answer text to an additional external service. The UI
  must obtain informed user consent and provide deletion/rebuild controls.
- Adds remote lifecycle, synchronization, billing, failure recovery, and
  orphan-cleanup behavior.
- Requires secure server-side or Electron-main use of the user's OpenAI key;
  Vector Store identifiers must not become authorization boundaries.

### Activation conditions

Consider this option only when profiling shows that local candidate retrieval
regularly misses semantic duplicates, the indexed corpus is large enough that
local retrieval or request transfer is slow, and OpenAI-only storage is an
acceptable product constraint.

Reference:
[OpenAI Vector Stores API](https://platform.openai.com/docs/api-reference/vector-stores).

## Sender-constrained Google OAuth

### Why it may be needed

The desktop client protects refresh tokens with Electron `safeStorage`, but
standard bearer refresh tokens can still be replayed after theft. Google's DPoP
support can bind new refresh tokens to a device-held P-256 private key.
Cross-Account Protection can separately notify an application backend when
Google invalidates a user's authorization.

### Possible design

- Generate one non-exportable P-256 key in a hardware-backed operating-system
  keystore and create a unique ES256 DPoP proof for every token request.
- Persist the DPoP nonce beside the encrypted refresh credential and retry once
  when Google returns `use_dpop_nonce`.
- Reauthorize existing desktop grants before treating them as DPoP-bound.
- Add a minimal authenticated backend before registering a Cross-Account
  Protection receiver; never expose RISC events directly to browser clients.

### Costs and constraints

- Electron does not provide one cross-platform API for non-exportable
  hardware-backed signing keys, so this requires platform-specific integration.
- DPoP adds key lifecycle, nonce, migration, and recovery behavior to every
  desktop token exchange.
- Cross-Account Protection requires a continuously reachable backend, which
  SCHDK does not currently operate.

### Activation conditions

Implement DPoP when supported desktop platforms have a verified hardware-backed
key integration or a compliance requirement mandates sender-constrained tokens.
Implement Cross-Account Protection only when SCHDK gains an authenticated
backend that can receive and act on RISC events.

References:
[Google OAuth best practices](https://developers.google.com/identity/protocols/oauth2/resources/best-practices)
and
[Google OAuth for desktop apps](https://developers.google.com/identity/protocols/oauth2/native-app).

## Local embedding model

### Why it may be needed

A local multilingual embedding model can represent each question as a vector
and retrieve semantic neighbors without uploading the user's full database to a
hosted vector service. It can improve paraphrase detection while preserving the
existing OpenAI, Anthropic, and Google generation choices.

### Possible design

- Select one versioned multilingual embedding model with verified Ukrainian and
  English retrieval quality.
- Run inference in a Web Worker in the browser and a worker thread or isolated
  process in desktop builds so indexing does not block the UI.
- Store model version, question fingerprint, and vector beside each question in
  the account-scoped Drive index or in a separate rebuildable index file.
- Re-embed only changed questions and rebuild vectors when the model version
  changes.
- Use cosine similarity to rank candidates for author-driven database search.

### Benefits

- Provider-neutral semantic retrieval.
- Question text stays on the user's device during candidate search.
- Predictable per-query cost after the model has been downloaded.
- Can work offline once the model and index are available locally.

### Costs and constraints

- Increases web download size, desktop package size, memory use, CPU use, and
  initial indexing time.
- Browser hardware and WebAssembly/WebGPU support vary; a CPU fallback may be
  too slow on older devices.
- Persisted vectors can make the Drive index substantially larger and require
  migrations whenever the model changes.
- Retrieval quality must be evaluated specifically on Ukrainian quiz questions;
  a generic multilingual benchmark is not sufficient.
- Model licenses and redistribution terms must be reviewed before bundling.

### Activation conditions

Consider this option when the lexical shortlist has measured recall problems,
users reject hosted question storage, the corpus is large enough to justify
semantic indexing, and performance tests show an acceptable model size,
indexing time, memory ceiling, and Ukrainian-language quality on supported
devices.
