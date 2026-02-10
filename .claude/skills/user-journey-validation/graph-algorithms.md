# Graph Algorithms for Journey Validation

This document provides language-agnostic pseudocode for navigation graph analysis, including orphan detection, cycle detection, and reachability analysis.

## Graph Construction

### Building the Navigation Graph

Convert a route registry into a directed graph:

```
function buildNavigationGraph(routes):
    graph = new DirectedGraph()

    for route in routes:
        // Add node for each route
        graph.addNode(route.path)

        // Add edges from entry points (incoming edges)
        for entryPoint in route.entry_points:
            graph.addEdge(entryPoint, route.path)

        // Add edges to exit points (outgoing edges)
        for exitPoint in route.exit_points:
            graph.addEdge(route.path, exitPoint)

    return graph
```

### Graph Data Structure

```
class DirectedGraph:
    nodes: Set<string>           // All route paths
    adjacencyList: Map<string, Set<string>>  // Outgoing edges
    reverseList: Map<string, Set<string>>    // Incoming edges

    function addNode(path):
        nodes.add(path)
        if path not in adjacencyList:
            adjacencyList[path] = new Set()
        if path not in reverseList:
            reverseList[path] = new Set()

    function addEdge(from, to):
        addNode(from)
        addNode(to)
        adjacencyList[from].add(to)
        reverseList[to].add(from)

    function getOutgoing(path):
        return adjacencyList[path] or empty Set

    function getIncoming(path):
        return reverseList[path] or empty Set
```

## Orphan Page Detection

### DFS-Based Reachability

Find all pages not reachable from the root:

```
function detectOrphanPages(graph, root = "/"):
    // Find all nodes reachable from root via DFS
    reachable = new Set()
    stack = [root]

    while stack is not empty:
        current = stack.pop()

        if current in reachable:
            continue

        reachable.add(current)

        // Add all outgoing neighbors to stack
        for neighbor in graph.getOutgoing(current):
            if neighbor not in reachable:
                stack.push(neighbor)

    // Orphans = all nodes minus reachable nodes
    orphans = []
    for node in graph.nodes:
        if node not in reachable:
            orphans.append(node)

    return orphans
```

### Complexity

- **Time**: O(V + E) where V = vertices (routes), E = edges (links)
- **Space**: O(V) for the visited set and stack

### Example

```
Graph:
  /           → /dashboard, /about
  /dashboard  → /settings, /reports
  /settings   → /dashboard
  /reports    → /dashboard
  /about      → /
  /hidden     → /admin       (orphan - no path from /)
  /admin      → /hidden      (orphan - no path from /)

detectOrphanPages(graph, "/"):
  reachable = {/, /dashboard, /about, /settings, /reports}
  orphans = [/hidden, /admin]
```

## Dead-End Detection

Find pages with no exit points (excluding expected terminal pages):

```
function detectDeadEnds(graph, allowedTerminals = ["/logout", "/404"]):
    deadEnds = []

    for node in graph.nodes:
        outgoing = graph.getOutgoing(node)

        // Dead end if no outgoing edges and not an allowed terminal
        if outgoing.isEmpty() and node not in allowedTerminals:
            deadEnds.append(node)

    return deadEnds
```

## Cycle Detection

Detect cycles in the navigation graph (not inherently bad, but useful info):

```
function detectCycles(graph):
    WHITE = 0  // Unvisited
    GRAY = 1   // Currently in recursion stack
    BLACK = 2  // Fully processed

    color = new Map()  // node -> color
    cycles = []

    for node in graph.nodes:
        color[node] = WHITE

    function dfs(node, path):
        color[node] = GRAY
        path.append(node)

        for neighbor in graph.getOutgoing(node):
            if color[neighbor] == GRAY:
                // Found cycle - extract cycle from path
                cycleStart = path.indexOf(neighbor)
                cycle = path.slice(cycleStart)
                cycle.append(neighbor)  // Complete the cycle
                cycles.append(cycle)

            else if color[neighbor] == WHITE:
                dfs(neighbor, path)

        path.pop()
        color[node] = BLACK

    for node in graph.nodes:
        if color[node] == WHITE:
            dfs(node, [])

    return cycles
```

### Complexity

- **Time**: O(V + E)
- **Space**: O(V) for color map and recursion stack

## Shortest Path (BFS)

Find shortest navigation path between two pages:

```
function shortestPath(graph, start, end):
    if start == end:
        return [start]

    visited = new Set()
    queue = [[start]]  // Queue of paths

    while queue is not empty:
        path = queue.dequeue()
        current = path[last]

        if current in visited:
            continue

        visited.add(current)

        for neighbor in graph.getOutgoing(current):
            newPath = path + [neighbor]

            if neighbor == end:
                return newPath

            if neighbor not in visited:
                queue.enqueue(newPath)

    return null  // No path exists
```

## Navigation Depth Analysis

Calculate the depth of each page from root:

```
function calculateDepths(graph, root = "/"):
    depths = new Map()
    depths[root] = 0

    queue = [root]

    while queue is not empty:
        current = queue.dequeue()
        currentDepth = depths[current]

        for neighbor in graph.getOutgoing(current):
            if neighbor not in depths:
                depths[neighbor] = currentDepth + 1
                queue.enqueue(neighbor)

    return depths
```

### Depth Warnings

```
function analyzeDepth(depths):
    warnings = []

    for path, depth in depths:
        if depth >= 5:
            warnings.append({
                path: path,
                depth: depth,
                severity: "HIGH",
                message: "Route nested too deeply, consider restructuring"
            })
        else if depth == 4:
            warnings.append({
                path: path,
                depth: depth,
                severity: "MEDIUM",
                message: "Route approaching maximum recommended depth"
            })

    return warnings
```

## Complete Validation Pipeline

Combine all checks into a validation pipeline:

```
function validateNavigationGraph(routes, config):
    graph = buildNavigationGraph(routes)
    results = {
        valid: true,
        errors: [],
        warnings: []
    }

    // 1. Orphan Detection
    orphans = detectOrphanPages(graph, config.root or "/")
    for orphan in orphans:
        results.errors.append({
            type: "ORPHAN",
            path: orphan,
            message: "Page has no navigation path from root"
        })
        results.valid = false

    // 2. Dead-End Detection
    deadEnds = detectDeadEnds(graph, config.allowedTerminals)
    for deadEnd in deadEnds:
        results.warnings.append({
            type: "DEAD_END",
            path: deadEnd,
            message: "Page has no exit navigation"
        })

    // 3. Cycle Detection (informational)
    cycles = detectCycles(graph)
    for cycle in cycles:
        results.warnings.append({
            type: "CYCLE",
            paths: cycle,
            message: "Navigation cycle detected"
        })

    // 4. Depth Analysis
    depths = calculateDepths(graph, config.root or "/")
    depthWarnings = analyzeDepth(depths)
    results.warnings.extend(depthWarnings)

    // 5. Bidirectional Check
    for node in graph.nodes:
        if node == config.root:
            continue

        incoming = graph.getIncoming(node)
        outgoing = graph.getOutgoing(node)

        // Check if user can return
        canReturn = false
        for inNode in incoming:
            if inNode in outgoing:
                canReturn = true
                break

        if not canReturn and not incoming.isEmpty():
            results.warnings.append({
                type: "NO_RETURN",
                path: node,
                message: "Page may not have clear return navigation"
            })

    return results
```

## Output Format

```yaml
validation_result:
  valid: false
  timestamp: "2026-01-11T12:00:00Z"

  summary:
    total_routes: 15
    orphans: 2
    dead_ends: 1
    cycles: 1
    depth_warnings: 3

  errors:
    - type: ORPHAN
      path: "/admin/hidden"
      message: "Page has no navigation path from root"
      severity: HIGH

    - type: ORPHAN
      path: "/legacy/old-page"
      message: "Page has no navigation path from root"
      severity: HIGH

  warnings:
    - type: DEAD_END
      path: "/onboarding/complete"
      message: "Page has no exit navigation"
      severity: MEDIUM

    - type: CYCLE
      paths: ["/a", "/b", "/c", "/a"]
      message: "Navigation cycle detected"
      severity: LOW

    - type: DEPTH
      path: "/settings/advanced/security/2fa/backup"
      depth: 5
      message: "Route nested too deeply, consider restructuring"
      severity: MEDIUM
```

## Performance Considerations

| Algorithm | Time Complexity | Space Complexity | Max Routes |
|-----------|-----------------|------------------|------------|
| Graph Construction | O(V + E) | O(V + E) | 10,000+ |
| Orphan Detection (DFS) | O(V + E) | O(V) | 10,000+ |
| Cycle Detection | O(V + E) | O(V) | 10,000+ |
| Shortest Path (BFS) | O(V + E) | O(V) | 10,000+ |
| Depth Analysis (BFS) | O(V + E) | O(V) | 10,000+ |
| Full Validation | O(V + E) | O(V + E) | 10,000+ |

All algorithms are linear in graph size, suitable for applications with thousands of routes.
