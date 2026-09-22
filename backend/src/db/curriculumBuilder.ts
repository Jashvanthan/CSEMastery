// Curriculum Builder with complete 200-day structure mapped to source PDFs and comprehensive CS topics
export interface TaskSeed {
  task_number: number;
  title: string;
  slug: string;
  subtopic: string;
  description: string;
  content: string;
  code_examples?: string;
  interview_questions?: string;
  common_mistakes?: string;
  practical_exercise?: string;
  checklist?: string[];
  estimated_minutes?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface DaySeed {
  day_number: number;
  week_id: number;
  week_number: number;
  track_id: string;
  title: string;
  topic: string;
  overview: string;
  learning_objectives: string[];
  estimated_minutes: number;
  practical_task: string;
  checklist: string[];
  tasks: TaskSeed[];
}

export interface WeekSeed {
  id: number;
  week_number: number;
  title: string;
  description: string;
  track_id: string;
}

export interface LeetCodeSeed {
  leetcode_number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  subtopic: string;
  week_id: number;
  related_day_id?: number;
  url: string;
  solution_approach: string;
  time_complexity: string;
  space_complexity: string;
}

export interface ProjectSeed {
  title: string;
  description: string;
  phase: string;
  track_id: string;
  tech_stack: string;
  requirements: string;
}

export function generateFullCurriculum(): {
  tracks: any[];
  weeks: WeekSeed[];
  days: DaySeed[];
  leetcodeProblems: LeetCodeSeed[];
  projects: ProjectSeed[];
} {
  const tracks = [
    {
      id: 'java',
      name: 'Java & Object-Oriented Engineering',
      description: 'From Java syntax and JVM internals to OOP, Collections, Streams, Concurrency, Virtual Threads, and Spring Boot 3.',
      icon: 'Coffee',
      color: '#f97316',
    },
    {
      id: 'dsa',
      name: 'Data Structures & Algorithms',
      description: 'Master core patterns, algorithmic thinking, data structures, and LeetCode problems from the 12-week blueprint.',
      icon: 'Binary',
      color: '#3b82f6',
    },
    {
      id: 'dbms',
      name: 'Database Management Systems & SQL',
      description: 'Relational algebra, SQL, Normalization, Storage, Indexing B+ trees, Concurrency 2PL, Recovery WAL, and Query Optimization.',
      icon: 'Database',
      color: '#10b981',
    },
    {
      id: 'fullstack',
      name: 'Full Stack Web Development',
      description: 'Modern frontend with React 19, TypeScript, Tailwind CSS, coupled with robust backend APIs, Node.js & Spring Boot.',
      icon: 'Layout',
      color: '#8b5cf6',
    },
    {
      id: 'ai',
      name: 'Artificial Intelligence & Applied ML',
      description: 'Machine learning fundamentals, Neural Networks, LLMs, Prompt Engineering, RAG architectures, and AI Agent development.',
      icon: 'Cpu',
      color: '#ec4899',
    },
    {
      id: 'capstone',
      name: 'System Design & Interview Mastery',
      description: 'Scalable system design, architectural patterns, production engineering capstone projects, and interview drills.',
      icon: 'Award',
      color: '#eab308',
    },
  ];

  const weeks: WeekSeed[] = [];
  const days: DaySeed[] = [];
  const leetcodeProblems: LeetCodeSeed[] = [];

  // Define weeks metadata (30 master weeks covering 200 days)
  const weekDefinitions = [
    // Weeks 1-6: Java Fundamentals, Advanced OOP, Collections, Concurrency & Modern Java (42 days: 6 wks * 7 days)
    { num: 1, title: 'Java Foundations, JVM Architecture & Control Flow', track: 'java', desc: 'Java environment setup, JVM internals, bytecode execution, memory model, primitive types, operators, and control flow.' },
    { num: 2, title: 'Java OOP: Classes, Encapsulation, Inheritance & Polymorphism', track: 'java', desc: 'Deep dive into OOP with Java: classes, objects, constructors, encapsulation, dynamic dispatch, abstraction, and interfaces.' },
    { num: 3, title: 'Java Advanced OOP: Generics, Reflection, Annotations & Records', track: 'java', desc: 'Java Generics, type erasure, Reflection API, custom annotations, records, sealed classes, and pattern matching.' },
    { num: 4, title: 'Java Collections Framework: Lists, Sets, Maps & Internals', track: 'java', desc: 'ArrayList vs LinkedList, HashSet backing, HashMap hashing mechanics, PriorityQueue binary heap, and ConcurrentHashMap.' },
    { num: 5, title: 'Java Concurrency, Multithreading & Virtual Threads', track: 'java', desc: 'Java Memory Model, thread life cycle, synchronization, ReentrantLock, ExecutorService, ForkJoinPool, and Virtual Threads (Java 21).' },
    { num: 6, title: 'Modern Java & Enterprise: Streams API & Spring Boot 3 Foundations', track: 'java', desc: 'Functional interfaces, Lambdas, Streams pipeline, Parallel Streams, Spring Boot IoC/DI, REST Controllers, and Spring Data JPA.' },

    // Weeks 7-14: Data Structures & Algorithms Core Blueprint (56 days: 8 wks * 7 days)
    { num: 7, title: 'Arrays, Two Pointers & Prefix Sums', track: 'dsa', desc: 'Array manipulations, two-pointer techniques, Kadane algorithm, sliding window, and prefix sums.' },
    { num: 8, title: 'Strings, Sliding Window & Pattern Matching', track: 'dsa', desc: 'String algorithms, anagram grouping, dynamic sliding window, palindromes, and KMP algorithm.' },
    { num: 9, title: 'Linked Lists & Fast-Slow Pointer Techniques', track: 'dsa', desc: 'Singly/doubly linked lists, cycle detection, reordering, dummy nodes, and recursive reversals.' },
    { num: 10, title: 'Trees, Binary Search Trees & Trie Structures', track: 'dsa', desc: 'Tree traversals, BST properties, LCA, diameter, Trie prefix trees, and tree dynamic programming.' },
    { num: 11, title: 'Stacks, Monotonic Queues & Expression Parsing', track: 'dsa', desc: 'Monotonic stacks, next greater element, RPN evaluation, and sliding window maximum with deques.' },
    { num: 12, title: 'Graphs, BFS/DFS, TopoSort & Shortest Paths', track: 'dsa', desc: 'Graph representations, connected components, topological sort, Disjoint Set Union (DSU), and Dijkstra algorithm.' },
    { num: 13, title: 'Dynamic Programming: 1D, 2D Grids & Knapsack Patterns', track: 'dsa', desc: 'Memoization vs tabulation, House Robber, Coin Change, Unique Paths, Longest Common Subsequence, and 0/1 Knapsack.' },
    { num: 14, title: 'Heaps, Sorting, Searching & Bit Manipulation', track: 'dsa', desc: 'Min/Max heaps, Top-K frequent elements, Merge/Quick sort, Binary search on answers, and bitwise XOR manipulations.' },

    // Weeks 15-22: Complete Database Management Systems & SQL Syllabus (54 days: Weeks 15-20 * 7 days + Weeks 21-22 * 6 days)
    { num: 15, title: 'DBMS 1: Relational Model & Relational Algebra', track: 'dbms', desc: 'DBMS vs file systems, levels of abstraction, relational model, integrity constraints, and relational algebra operators.' },
    { num: 16, title: 'DBMS 2: SQL DDL, DML, Joins & Advanced Queries', track: 'dbms', desc: 'CREATE TABLE, schema constraints, joins, GROUP BY/HAVING, subqueries, CTEs, and window functions.' },
    { num: 17, title: 'DBMS 3: Advanced SQL, JDBC & ER Modeling', track: 'dbms', desc: 'Connection libraries JDBC/ODBC, stored procedures, triggers, TRC/DRC, and ER diagrams to schema mapping.' },
    { num: 18, title: 'DBMS 4: Normalization & Functional Dependencies', track: 'dbms', desc: 'Data anomalies, lossless join, dependency preservation, 1NF, 2NF, 3NF, BCNF, Armstrong axioms, and 4NF.' },
    { num: 19, title: 'DBMS 5: App Architecture, Security & Storage Hierarchy', track: 'dbms', desc: '3-Tier architecture, MVC, SQL injection prevention, storage hierarchy, RAID, slotted pages, buffer management.' },
    { num: 20, title: 'DBMS 6: Indexing, B+ Trees & Dynamic Hashing', track: 'dbms', desc: 'Primary vs secondary indexes, 2-3-4 trees, B+ tree mechanics, fan-out, extendable hashing, and index design.' },
    { num: 21, title: 'DBMS 7: Transactions & Concurrency Control', track: 'dbms', desc: 'ACID properties, conflict serializability, precedence graphs, recoverability, 2PL, deadlock prevention & timestamps.' },
    { num: 22, title: 'DBMS 8: Recovery Systems & Query Optimization', track: 'dbms', desc: 'Log-based recovery, WAL, Redo-Undo algorithm, query cost evaluation, join algorithms, and equivalence rules.' },

    // Weeks 23-27: Full Stack Web Development (30 days: 5 wks * 6 days)
    { num: 23, title: 'Modern Frontend: React 19 Foundations & Architecture', track: 'fullstack', desc: 'JSX, components, props, state, event handling, rendering lifecycle, and clean UI architecture.' },
    { num: 24, title: 'React Hooks, State Management & Custom Hooks', track: 'fullstack', desc: 'useState, useEffect, useMemo, useCallback, useRef, custom hooks, and context state management.' },
    { num: 25, title: 'Frontend Engineering: Router, Tailwind CSS & TypeScript', track: 'fullstack', desc: 'React Router v6/v7, TypeScript in React, Tailwind CSS design system, responsive UI, and forms.' },
    { num: 26, title: 'Backend APIs: Node.js, Express & REST Architecture', track: 'fullstack', desc: 'REST API design, routing, middleware, error handling, JWT auth, validation, and PostgreSQL connection.' },
    { num: 27, title: 'Spring Boot 3, Spring Data JPA & Full Stack Auth', track: 'fullstack', desc: 'Spring Boot starters, REST Controllers, Service layer, Hibernate/JPA entity mapping, and Spring Security with JWT.' },

    // Weeks 28-29: Artificial Intelligence & Applied Machine Learning (12 days: 2 wks * 6 days)
    { num: 28, title: 'AI Foundations, Machine Learning & Neural Networks', track: 'ai', desc: 'AI/ML taxonomy, data preprocessing, regression, classification, neural networks, backpropagation, and PyTorch basics.' },
    { num: 29, title: 'Generative AI, LLMs, RAG & Autonomous AI Agents', track: 'ai', desc: 'Transformer architecture, embeddings, vector databases, Retrieval-Augmented Generation, and AI agent frameworks.' },

    // Week 30: System Design, Capstone & Interview Mastery (6 days: 1 wk * 6 days)
    { num: 30, title: 'System Design, Capstones & Production Engineering', track: 'capstone', desc: 'High-level system design, microservices, caching, production full-stack AI capstone, and mock interview questions.' }
  ];

  for (const w of weekDefinitions) {
    weeks.push({
      id: w.num,
      week_number: w.num,
      title: w.title,
      description: w.desc,
      track_id: w.track,
    });
  }

  // Helper to build rich structured days
  function buildDay(
    dayNum: number,
    weekNum: number,
    trackId: string,
    topic: string,
    title: string,
    overview: string,
    subtopicsList: { title: string; desc: string; content: string; code?: string; interview?: string }[],
    practicalTask: string,
    checklistItems: string[]
  ): DaySeed {
    const tasks: TaskSeed[] = subtopicsList.map((st, idx) => ({
      task_number: idx + 1,
      title: st.title,
      slug: `day-${dayNum}-task-${idx + 1}`,
      subtopic: st.title,
      description: st.desc,
      content: st.content,
      code_examples: st.code || '// Practical demonstration\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Executing ' + st.title + '");\n    }\n}',
      interview_questions: st.interview || 'Q: What is the time complexity and primary trade-off of this approach?\nA: It minimizes memory overhead while maintaining optimal asymptotic bounds.',
      common_mistakes: 'Common pitfall: Forgetting edge cases like boundary values, null references, or unclosed resources.',
      practical_exercise: 'Implement and test the algorithm/pattern on sample inputs with edge cases.',
      checklist: ['Concept thoroughly understood', 'Code example analyzed and reproduced', 'Edge cases verified', 'Complexity trade-offs noted'],
      estimated_minutes: 25,
      difficulty: 'Medium',
    }));

    return {
      day_number: dayNum,
      week_id: weekNum,
      week_number: weekNum,
      track_id: trackId,
      title,
      topic,
      overview,
      learning_objectives: subtopicsList.map((s) => `Understand and master ${s.title}`),
      estimated_minutes: tasks.reduce((sum, t) => sum + (t.estimated_minutes || 25), 0),
      practical_task: practicalTask,
      checklist: checklistItems,
      tasks,
    };
  }

  // 1. Seed DSA LeetCode problems accurately from PDF (Mapped to DSA Weeks 7 to 14)
  const leetcodeSource = [
    // DSA Week 7: Arrays
    { num: 1, title: 'Two Sum', diff: 'Easy', top: 'Arrays', sub: 'Two Pointers / Hash Map', wk: 7, url: 'https://leetcode.com/problems/two-sum/' },
    { num: 121, title: 'Best Time to Buy and Sell Stock', diff: 'Easy', top: 'Arrays', sub: 'Sliding Window / Min Tracking', wk: 7, url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { num: 217, title: 'Contains Duplicate', diff: 'Easy', top: 'Arrays', sub: 'Hash Set', wk: 7, url: 'https://leetcode.com/problems/contains-duplicate/' },
    { num: 53, title: 'Maximum Subarray', diff: 'Easy', top: 'Arrays', sub: "Kadane's Algorithm", wk: 7, url: 'https://leetcode.com/problems/maximum-subarray/' },
    { num: 238, title: 'Product of Array Except Self', diff: 'Medium', top: 'Arrays', sub: 'Prefix Sums / In-place', wk: 7, url: 'https://leetcode.com/problems/product-of-array-except-self/' },
    { num: 15, title: '3Sum', diff: 'Medium', top: 'Arrays', sub: 'Two Pointers / Sorting', wk: 7, url: 'https://leetcode.com/problems/3sum/' },
    { num: 11, title: 'Container With Most Water', diff: 'Medium', top: 'Arrays', sub: 'Two Pointers', wk: 7, url: 'https://leetcode.com/problems/container-with-most-water/' },
    { num: 560, title: 'Subarray Sum Equals K', diff: 'Medium', top: 'Arrays', sub: 'Prefix Sum + HashMap', wk: 7, url: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
    { num: 73, title: 'Set Matrix Zeroes', diff: 'Medium', top: 'Arrays', sub: 'Matrix Traversal', wk: 7, url: 'https://leetcode.com/problems/set-matrix-zeroes/' },
    { num: 54, title: 'Spiral Matrix', diff: 'Medium', top: 'Arrays', sub: 'Matrix Traversal', wk: 7, url: 'https://leetcode.com/problems/spiral-matrix/' },
    { num: 42, title: 'Trapping Rain Water', diff: 'Hard', top: 'Arrays', sub: 'Two Pointers / Monotonic Stack', wk: 7, url: 'https://leetcode.com/problems/trapping-rain-water/' },
    { num: 41, title: 'First Missing Positive', diff: 'Hard', top: 'Arrays', sub: 'In-place Hashing', wk: 7, url: 'https://leetcode.com/problems/first-missing-positive/' },

    // DSA Week 8: Strings
    { num: 242, title: 'Valid Anagram', diff: 'Easy', top: 'Strings', sub: 'Frequency Counting', wk: 8, url: 'https://leetcode.com/problems/valid-anagram/' },
    { num: 125, title: 'Valid Palindrome', diff: 'Easy', top: 'Strings', sub: 'Two Pointers', wk: 8, url: 'https://leetcode.com/problems/valid-palindrome/' },
    { num: 14, title: 'Longest Common Prefix', diff: 'Easy', top: 'Strings', sub: 'String Parsing', wk: 8, url: 'https://leetcode.com/problems/longest-common-prefix/' },
    { num: 3, title: 'Longest Substring Without Repeating Characters', diff: 'Medium', top: 'Strings', sub: 'Sliding Window', wk: 8, url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { num: 49, title: 'Group Anagrams', diff: 'Medium', top: 'Strings', sub: 'Hash Map Grouping', wk: 8, url: 'https://leetcode.com/problems/group-anagrams/' },
    { num: 424, title: 'Longest Repeating Character Replacement', diff: 'Medium', top: 'Strings', sub: 'Sliding Window', wk: 8, url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
    { num: 5, title: 'Longest Palindromic Substring', diff: 'Medium', top: 'Strings', sub: 'Expand Around Center', wk: 8, url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
    { num: 647, title: 'Palindromic Substrings', diff: 'Medium', top: 'Strings', sub: 'Expand Around Center', wk: 8, url: 'https://leetcode.com/problems/palindromic-substrings/' },
    { num: 8, title: 'String to Integer (atoi)', diff: 'Medium', top: 'Strings', sub: 'Parsing & Bounds', wk: 8, url: 'https://leetcode.com/problems/string-to-integer-atoi/' },
    { num: 76, title: 'Minimum Window Substring', diff: 'Hard', top: 'Strings', sub: 'Sliding Window + Map', wk: 8, url: 'https://leetcode.com/problems/minimum-window-substring/' },
    { num: 72, title: 'Edit Distance', diff: 'Hard', top: 'Strings', sub: 'Dynamic Programming', wk: 8, url: 'https://leetcode.com/problems/edit-distance/' },

    // DSA Week 9: Linked Lists
    { num: 206, title: 'Reverse Linked List', diff: 'Easy', top: 'Linked Lists', sub: 'Pointer Manipulation', wk: 9, url: 'https://leetcode.com/problems/reverse-linked-list/' },
    { num: 21, title: 'Merge Two Sorted Lists', diff: 'Easy', top: 'Linked Lists', sub: 'Dummy Node', wk: 9, url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
    { num: 141, title: 'Linked List Cycle', diff: 'Easy', top: 'Linked Lists', sub: 'Fast & Slow Pointers', wk: 9, url: 'https://leetcode.com/problems/linked-list-cycle/' },
    { num: 876, title: 'Middle of the Linked List', diff: 'Easy', top: 'Linked Lists', sub: 'Fast & Slow Pointers', wk: 9, url: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
    { num: 234, title: 'Palindrome Linked List', diff: 'Easy', top: 'Linked Lists', sub: 'Reverse Second Half', wk: 9, url: 'https://leetcode.com/problems/palindrome-linked-list/' },
    { num: 19, title: 'Remove Nth Node From End of List', diff: 'Medium', top: 'Linked Lists', sub: 'Two Pointers Offset', wk: 9, url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
    { num: 142, title: 'Linked List Cycle II', diff: 'Medium', top: 'Linked Lists', sub: "Floyd's Cycle Finding", wk: 9, url: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
    { num: 143, title: 'Reorder List', diff: 'Medium', top: 'Linked Lists', sub: 'Split, Reverse & Merge', wk: 9, url: 'https://leetcode.com/problems/reorder-list/' },
    { num: 148, title: 'Sort List', diff: 'Medium', top: 'Linked Lists', sub: 'Merge Sort on Lists', wk: 9, url: 'https://leetcode.com/problems/sort-list/' },
    { num: 2, title: 'Add Two Numbers', diff: 'Medium', top: 'Linked Lists', sub: 'Elementary Math & Carry', wk: 9, url: 'https://leetcode.com/problems/add-two-numbers/' },
    { num: 25, title: 'Reverse Nodes in k-Group', diff: 'Hard', top: 'Linked Lists', sub: 'Iterative Group Reversal', wk: 9, url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },

    // DSA Week 10: Trees & BSTs
    { num: 104, title: 'Maximum Depth of Binary Tree', diff: 'Easy', top: 'Trees', sub: 'DFS / BFS', wk: 10, url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
    { num: 226, title: 'Invert Binary Tree', diff: 'Easy', top: 'Trees', sub: 'DFS Recursion', wk: 10, url: 'https://leetcode.com/problems/invert-binary-tree/' },
    { num: 100, title: 'Same Tree', diff: 'Easy', top: 'Trees', sub: 'Tree Traversal', wk: 10, url: 'https://leetcode.com/problems/same-tree/' },
    { num: 572, title: 'Subtree of Another Tree', diff: 'Easy', top: 'Trees', sub: 'Tree Matching', wk: 10, url: 'https://leetcode.com/problems/subtree-of-another-tree/' },
    { num: 543, title: 'Diameter of Binary Tree', diff: 'Easy', top: 'Trees', sub: 'Post-order DFS', wk: 10, url: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
    { num: 102, title: 'Binary Tree Level Order Traversal', diff: 'Medium', top: 'Trees', sub: 'BFS with Queue', wk: 10, url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
    { num: 98, title: 'Validate Binary Search Tree', diff: 'Medium', top: 'Trees', sub: 'In-order / Min-Max Bounds', wk: 10, url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
    { num: 230, title: 'Kth Smallest Element in a BST', diff: 'Medium', top: 'Trees', sub: 'In-order Traversal', wk: 10, url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
    { num: 235, title: 'Lowest Common Ancestor of a BST', diff: 'Medium', top: 'Trees', sub: 'BST Property Navigation', wk: 10, url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
    { num: 236, title: 'Lowest Common Ancestor of a Binary Tree', diff: 'Medium', top: 'Trees', sub: 'Post-order Traversal', wk: 10, url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
    { num: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', diff: 'Medium', top: 'Trees', sub: 'Divide & Conquer', wk: 10, url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
    { num: 208, title: 'Implement Trie (Prefix Tree)', diff: 'Medium', top: 'Trees', sub: 'Trie Node Array', wk: 10, url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
    { num: 124, title: 'Binary Tree Maximum Path Sum', diff: 'Hard', top: 'Trees', sub: 'DFS Subtree Contributions', wk: 10, url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
    { num: 297, title: 'Serialize and Deserialize Binary Tree', diff: 'Hard', top: 'Trees', sub: 'Preorder BFS/DFS Parsing', wk: 10, url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },

    // DSA Week 11: Stacks & Queues
    { num: 20, title: 'Valid Parentheses', diff: 'Easy', top: 'Stacks', sub: 'Bracket Matching', wk: 11, url: 'https://leetcode.com/problems/valid-parentheses/' },
    { num: 155, title: 'Min Stack', diff: 'Medium', top: 'Stacks', sub: 'Auxiliary Min Tracking', wk: 11, url: 'https://leetcode.com/problems/min-stack/' },
    { num: 150, title: 'Evaluate Reverse Polish Notation', diff: 'Medium', top: 'Stacks', sub: 'Expression Evaluation', wk: 11, url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
    { num: 739, title: 'Daily Temperatures', diff: 'Medium', top: 'Stacks', sub: 'Monotonic Decreasing Stack', wk: 11, url: 'https://leetcode.com/problems/daily-temperatures/' },
    { num: 853, title: 'Car Fleet', diff: 'Medium', top: 'Stacks', sub: 'Sorting & Time Monotonic Stack', wk: 11, url: 'https://leetcode.com/problems/car-fleet/' },
    { num: 84, title: 'Largest Rectangle in Histogram', diff: 'Hard', top: 'Stacks', sub: 'Monotonic Stack Width', wk: 11, url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
    { num: 239, title: 'Sliding Window Maximum', diff: 'Hard', top: 'Stacks', sub: 'Monotonic Decreasing Deque', wk: 11, url: 'https://leetcode.com/problems/sliding-window-maximum/' },

    // DSA Week 12: Graphs
    { num: 200, title: 'Number of Islands', diff: 'Medium', top: 'Graphs', sub: 'Grid BFS / DFS', wk: 12, url: 'https://leetcode.com/problems/number-of-islands/' },
    { num: 133, title: 'Clone Graph', diff: 'Medium', top: 'Graphs', sub: 'BFS / DFS with Map', wk: 12, url: 'https://leetcode.com/problems/clone-graph/' },
    { num: 695, title: 'Max Area of Island', diff: 'Medium', top: 'Graphs', sub: 'Grid DFS Area', wk: 12, url: 'https://leetcode.com/problems/max-area-of-island/' },
    { num: 417, title: 'Pacific Atlantic Water Flow', diff: 'Medium', top: 'Graphs', sub: 'Reverse DFS from Oceans', wk: 12, url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
    { num: 207, title: 'Course Schedule', diff: 'Medium', top: 'Graphs', sub: "Topological Sort / Kahn's", wk: 12, url: 'https://leetcode.com/problems/course-schedule/' },
    { num: 210, title: 'Course Schedule II', diff: 'Medium', top: 'Graphs', sub: "Topological Sort / Kahn's", wk: 12, url: 'https://leetcode.com/problems/course-schedule-ii/' },
    { num: 684, title: 'Redundant Connection', diff: 'Medium', top: 'Graphs', sub: 'Disjoint Set Union (DSU)', wk: 12, url: 'https://leetcode.com/problems/redundant-connection/' },
    { num: 323, title: 'Number of Connected Components in an Undirected Graph', diff: 'Medium', top: 'Graphs', sub: 'DSU / BFS', wk: 12, url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
    { num: 261, title: 'Graph Valid Tree', diff: 'Medium', top: 'Graphs', sub: 'DSU Cycle Detection', wk: 12, url: 'https://leetcode.com/problems/graph-valid-tree/' },
    { num: 743, title: 'Network Delay Time', diff: 'Medium', top: 'Graphs', sub: "Dijkstra's Algorithm", wk: 12, url: 'https://leetcode.com/problems/network-delay-time/' },
    { num: 127, title: 'Word Ladder', diff: 'Hard', top: 'Graphs', sub: 'Bidirectional BFS', wk: 12, url: 'https://leetcode.com/problems/word-ladder/' },
    { num: 787, title: 'Cheapest Flights Within K Stops', diff: 'Medium', top: 'Graphs', sub: 'Bellman-Ford / Modified Dijkstra', wk: 12, url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },

    // DSA Week 13: Dynamic Programming
    { num: 70, title: 'Climbing Stairs', diff: 'Easy', top: 'Dynamic Programming', sub: 'Fibonacci DP', wk: 13, url: 'https://leetcode.com/problems/climbing-stairs/' },
    { num: 746, title: 'Min Cost Climbing Stairs', diff: 'Easy', top: 'Dynamic Programming', sub: '1D State Transitions', wk: 13, url: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
    { num: 198, title: 'House Robber', diff: 'Medium', top: 'Dynamic Programming', sub: 'Include / Exclude Choice', wk: 13, url: 'https://leetcode.com/problems/house-robber/' },
    { num: 213, title: 'House Robber II', diff: 'Medium', top: 'Dynamic Programming', sub: 'Circular State Reduction', wk: 13, url: 'https://leetcode.com/problems/house-robber-ii/' },
    { num: 322, title: 'Coin Change', diff: 'Medium', top: 'Dynamic Programming', sub: 'Unbounded Knapsack', wk: 13, url: 'https://leetcode.com/problems/coin-change/' },
    { num: 518, title: 'Coin Change II', diff: 'Medium', top: 'Dynamic Programming', sub: 'Unbounded Knapsack Combinations', wk: 13, url: 'https://leetcode.com/problems/coin-change-ii/' },
    { num: 300, title: 'Longest Increasing Subsequence', diff: 'Medium', top: 'Dynamic Programming', sub: 'Patience Sorting / O(N log N)', wk: 13, url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
    { num: 1143, title: 'Longest Common Subsequence', diff: 'Medium', top: 'Dynamic Programming', sub: '2D DP Grid', wk: 13, url: 'https://leetcode.com/problems/longest-common-subsequence/' },
    { num: 416, title: 'Partition Equal Subset Sum', diff: 'Medium', top: 'Dynamic Programming', sub: '0/1 Knapsack Boolean', wk: 13, url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
    { num: 62, title: 'Unique Paths', diff: 'Medium', top: 'Dynamic Programming', sub: 'Grid Combinatorics / DP', wk: 13, url: 'https://leetcode.com/problems/unique-paths/' },
    { num: 64, title: 'Minimum Path Sum', diff: 'Medium', top: 'Dynamic Programming', sub: 'Grid Path Optimization', wk: 13, url: 'https://leetcode.com/problems/minimum-path-sum/' },
    { num: 91, title: 'Decode Ways', diff: 'Medium', top: 'Dynamic Programming', sub: 'String State Transitions', wk: 13, url: 'https://leetcode.com/problems/decode-ways/' },
    { num: 139, title: 'Word Break', diff: 'Medium', top: 'Dynamic Programming', sub: '1D Boolean Memoization', wk: 13, url: 'https://leetcode.com/problems/word-break/' },

    // DSA Week 14: Heaps, Searching & Sorting
    { num: 1046, title: 'Last Stone Weight', diff: 'Easy', top: 'Heaps', sub: 'Max Heap', wk: 14, url: 'https://leetcode.com/problems/last-stone-weight/' },
    { num: 703, title: 'Kth Largest Element in a Stream', diff: 'Easy', top: 'Heaps', sub: 'Min Heap', wk: 14, url: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
    { num: 215, title: 'Kth Largest Element in an Array', diff: 'Medium', top: 'Heaps', sub: 'QuickSelect / Min Heap', wk: 14, url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
    { num: 347, title: 'Top K Frequent Elements', diff: 'Medium', top: 'Heaps', sub: 'Bucket Sort / Min Heap', wk: 14, url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    { num: 973, title: 'K Closest Points to Origin', diff: 'Medium', top: 'Heaps', sub: 'Max Heap', wk: 14, url: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
    { num: 621, title: 'Task Scheduler', diff: 'Medium', top: 'Heaps', sub: 'Greedy / Max Heap', wk: 14, url: 'https://leetcode.com/problems/task-scheduler/' },
    { num: 767, title: 'Reorganize String', diff: 'Medium', top: 'Heaps', sub: 'Max Heap + Waiting Queue', wk: 14, url: 'https://leetcode.com/problems/reorganize-string/' },
    { num: 373, title: 'Find K Pairs with Smallest Sums', diff: 'Medium', top: 'Heaps', sub: 'Min Heap Index Pairs', wk: 14, url: 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/' },
    { num: 295, title: 'Find Median from Data Stream', diff: 'Hard', top: 'Heaps', sub: 'Two Heaps Pattern', wk: 14, url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
    { num: 23, title: 'Merge k Sorted Lists', diff: 'Hard', top: 'Heaps', sub: 'Min Heap of Heads', wk: 14, url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    { num: 704, title: 'Binary Search', diff: 'Easy', top: 'Searching', sub: 'Standard Binary Search', wk: 14, url: 'https://leetcode.com/problems/binary-search/' },
    { num: 33, title: 'Search in Rotated Sorted Array', diff: 'Medium', top: 'Searching', sub: 'Rotated Binary Search', wk: 14, url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
    { num: 153, title: 'Find Minimum in Rotated Sorted Array', diff: 'Medium', top: 'Searching', sub: 'Rotated Binary Search', wk: 14, url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
    { num: 74, title: 'Search a 2D Matrix', diff: 'Medium', top: 'Searching', sub: '2D Binary Search', wk: 14, url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
    { num: 875, title: 'Koko Eating Bananas', diff: 'Medium', top: 'Searching', sub: 'Binary Search on Answer', wk: 14, url: 'https://leetcode.com/problems/koko-eating-bananas/' },
    { num: 4, title: 'Median of Two Sorted Arrays', diff: 'Hard', top: 'Searching', sub: 'Binary Search on Partition', wk: 14, url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    { num: 410, title: 'Split Array Largest Sum', diff: 'Hard', top: 'Searching', sub: 'Binary Search on Answer', wk: 14, url: 'https://leetcode.com/problems/split-array-largest-sum/' },
  ];

  for (const lp of leetcodeSource) {
    leetcodeProblems.push({
      leetcode_number: lp.num,
      title: lp.title,
      difficulty: lp.diff as 'Easy' | 'Medium' | 'Hard',
      topic: lp.top,
      subtopic: lp.sub,
      week_id: lp.wk,
      url: lp.url,
      solution_approach: `Optimal solution for ${lp.title} using ${lp.sub}. Analyze edge conditions and invariants.`,
      time_complexity: lp.diff === 'Hard' ? 'O(N log N) / O(N)' : 'O(N) / O(log N)',
      space_complexity: 'O(1) / O(N)',
    });
  }

  // 2. Explicitly define Days 1 to 14 for the Java Track (Weeks 1 & 2)
  const curriculumMap: { [day: number]: { week: number; track: string; topic: string; title: string; tasks: { title: string; desc: string; content: string; code?: string; interview?: string }[] } } = {
    // Week 1 (Days 1-7): Java Foundations, JVM Architecture & Control Flow
    1: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java Environment, JVM Architecture & Bytecode Execution',
      tasks: [
        {
          title: 'JDK, JRE & JVM Architecture',
          desc: 'Detailed breakdown of the Java virtual machine components and runtime execution.',
          content: 'The Java Virtual Machine (JVM) is an abstract computing machine that executes compiled Java bytecode. It consists of three subsystems: ClassLoader Subsystem (Loading, Linking, Initialization), Runtime Data Areas (Method Area/Metaspace, Heap, Java Thread Stacks, PC Registers, Native Method Stacks), and Execution Engine (Interpreter, JIT Compiler, Garbage Collector).',
          code: `// Verify JVM Architecture & Runtime properties
public class JVMInspector {
    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("Available Processors: " + runtime.availableProcessors());
        System.out.println("Max Heap Memory: " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
        System.out.println("Total Allocated Memory: " + (runtime.totalMemory() / (1024 * 1024)) + " MB");
    }
}`,
          interview: 'Q: What is the difference between JDK, JRE, and JVM?\nA: JVM is the runtime engine executing bytecode. JRE contains the JVM plus core class libraries. JDK is the complete developer kit containing JRE, compiler (javac), debugger (jdb), and archiving tools (jar).'
        },
        {
          title: 'Bytecode Compilation & JIT HotSpot Engine',
          desc: 'Understanding `javac` compilation to `.class` files and JIT tiered compilation.',
          content: 'Java source code (.java) is compiled into architecture-neutral bytecode (.class) by javac. At runtime, the JVM interpreter executes bytecode immediately, while the Just-In-Time (JIT) HotSpot compiler profiles execution frequency and compiles heavily-used hot spots into native CPU machine code (C1 client compiler for fast startup, C2 server compiler for aggressive inlining and loop unrolling).',
          code: `// Disassemble bytecode with: javap -c MemoryDemo
public class MemoryDemo {
    public int compute(int a, int b) {
        int sum = a + b; // iload_1, iload_2, iadd, istore_3
        return sum * 2;  // iload_3, iconst_2, imul, ireturn
    }
}`,
          interview: 'Q: How does JIT compilation improve performance compared to pure interpretation?\nA: JIT analyzes hot code paths at runtime, performing optimizations like method inlining, loop unrolling, dead code elimination, and compiling directly to native machine instructions.'
        },
        {
          title: 'Primitive Types, Sizes & Stack Allocation',
          desc: 'Bit widths, signed ranges, and memory layout of 8 primitive data types.',
          content: 'Java defines 8 primitive types: byte (8-bit, -128 to 127), short (16-bit, -32768 to 32767), int (32-bit), long (64-bit), float (32-bit IEEE 754), double (64-bit IEEE 754), char (16-bit Unicode 0 to 65535), and boolean (JVM-dependent, evaluated as int in bytecodes). Primitive local variables are stored directly inside the thread stack frame, eliminating heap pointer indirection.',
          code: `public class PrimitivesGuide {
    public static void main(String[] args) {
        byte b = 127;
        short s = 32767;
        int i = 2_147_483_647;
        long l = 9_223_372_036_854_775_807L;
        float f = 3.14159f;
        double d = 2.718281828459045;
        char c = 'A';
        boolean flag = true;
        System.out.printf("int range: [%d, %d]%n", Integer.MIN_VALUE, Integer.MAX_VALUE);
    }
}`,
          interview: 'Q: Where are primitive local variables stored vs primitive instance variables?\nA: Primitive local variables are allocated inside the stack frame of the executing thread. Primitive instance variables are allocated as part of the object payload on the heap.'
        },
        {
          title: 'Operators, Precedence, Bitwise Operations & Promotion',
          desc: 'Arithmetic, logical short-circuiting, bitwise masks, and numeric type promotion rules.',
          content: 'Binary numeric promotion rules automatically widen operands: if any operand is double, float, or long, others are promoted accordingly; otherwise, byte, short, and char are always promoted to int before evaluation. Short-circuit operators (&&, ||) evaluate right-hand expressions only when left-hand operand is insufficient to determine the result.',
          code: `public class BitwiseBitMask {
    public static void main(String[] args) {
        int flags = 0b0000_0101; // Flags 1 and 3 active
        int MASK_READ = 1 << 0;  // 0001
        int MASK_WRITE = 1 << 1; // 0010
        boolean canRead = (flags & MASK_READ) != 0;
        flags |= MASK_WRITE; // Enable write permission
        System.out.println("Can read: " + canRead + ", Updated flags: " + Integer.toBinaryString(flags));
    }
}`,
          interview: 'Q: What is the difference between `&` and `&&` in Java?\nA: `&` is both a bitwise operator and a non-short-circuit logical operator evaluating both sides. `&&` is a short-circuit logical operator evaluating the second operand only if the first is true.'
        },
        {
          title: 'First Java Application, Packages & CLI Build Tools',
          desc: 'Class declaration, public static void main mechanics, packages, and Maven/Gradle basics.',
          content: 'The entry point `public static void main(String[] args)` is declared `public` (accessible to JVM ClassLoader), `static` (invocable without creating class instance), `void` (returns no value), and receives CLI arguments as a `String[]` array. Packages provide hierarchical namespace isolation matching file system paths.',
          code: `package com.mastery.foundations;

public class MainApp {
    public static void main(String[] args) {
        for (int i = 0; i < args.length; i++) {
            System.out.println("Argument " + i + ": " + args[i]);
        }
    }
}`,
          interview: 'Q: Why must main() be static in Java?\nA: If main() were not static, the JVM would have to create an instance of the class before invoking main(), which would require calling a constructor that might need parameters or throw exceptions.'
        }
      ]
    },
    2: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java Variables, Scope, Wrapper Classes & Memory Lifecycle',
      tasks: [
        {
          title: 'Variable Declarations, Scope & Variable Shadowing',
          desc: 'Local variables, instance variables, class static variables, and lexical scoping.',
          content: 'Variable scope defines accessibility and lifetime. Local variables exist only while their enclosing stack frame / block executes and are NOT initialized with default values. Instance variables belong to heap objects and are default-initialized (0, false, null). Class static variables exist for the lifetime of the loaded Class object.',
          code: `public class ScopeDemo {
    private static int classVar = 100; // Class scope
    private int instanceVar = 50;      // Object heap scope

    public void calculate(int instanceVar) { // Parameter shadows instanceVar
        int localVar = 10;                  // Stack scope
        System.out.println("Local: " + localVar);
        System.out.println("Shadowed Instance: " + this.instanceVar);
        System.out.println("Class: " + ScopeDemo.classVar);
    }
}`,
          interview: 'Q: What happens if you access an uninitialized local variable in Java?\nA: The Java compiler produces a compile-time error: "variable might not have been initialized". Instance and static variables receive default zero-values.'
        },
        {
          title: 'Wrapper Classes, Autoboxing & Unboxing Internals',
          desc: 'Integer, Double, Boolean, Autoboxing performance pitfalls, and IntegerCache.',
          content: 'Wrapper classes provide object representations for primitives (Integer for int, Double for double). Java 5 introduced Autoboxing (automatic `Integer.valueOf(i)`) and Unboxing (`wrapper.intValue()`). The IntegerCache caches values from -128 to 127, making `Integer.valueOf(100) == Integer.valueOf(100)` true, but `Integer.valueOf(500) == Integer.valueOf(500)` false.',
          code: `public class AutoboxingPitfall {
    public static void main(String[] args) {
        Integer a = 127;
        Integer b = 127;
        System.out.println("127 == 127: " + (a == b)); // true (IntegerCache)

        Integer x = 128;
        Integer y = 128;
        System.out.println("128 == 128: " + (x == y)); // false (different objects)
        System.out.println("128 equals 128: " + x.equals(y)); // true
    }
}`,
          interview: 'Q: What is the Integer Cache in Java and what is its default range?\nA: IntegerCache caches Integer objects for values between -128 and +127 (configurable via -XX:AutoBoxCacheMax) to optimize memory and avoid repeated object allocations.'
        },
        {
          title: 'Type Casting: Implicit Widening vs Explicit Narrowing',
          desc: 'Conversion rules between numeric types, data truncation, and sign extension.',
          content: 'Widening casting occurs automatically when converting a smaller type to a larger type (e.g. int to long or float to double) without data loss. Narrowing casting requires explicit cast operator `(int) longVal` and can cause bit truncation and sign overflow.',
          code: `public class CastingRules {
    public static void main(String[] args) {
        long large = 300L;
        byte truncated = (byte) large; // 300 % 256 = 44
        System.out.println("Truncated byte: " + truncated); // 44
        
        double pi = 3.1415926535;
        int intPi = (int) pi; // 3 (fractional truncated)
        System.out.println("Truncated int: " + intPi);
    }
}`,
          interview: 'Q: What occurs during arithmetic overflow in Java?\nA: Java does not throw exceptions on integer overflow; it wraps around silently according to two-complement binary arithmetic (e.g., Integer.MAX_VALUE + 1 == Integer.MIN_VALUE).'
        },
        {
          title: 'Constants, The `final` Keyword on Variables',
          desc: 'Compile-time constants vs runtime final references and immutability.',
          content: 'A `final` variable can be assigned exactly once. If initialized with a compile-time constant expression, the compiler inlines the literal directly into calling bytecode. On object references, `final` guarantees that the reference pointer cannot be reassigned, but the underlying object fields remain mutable unless designed as immutable.',
          code: `public class FinalReferenceDemo {
    public static final int MAX_CONNECTIONS = 100; // Inlined constant

    public static void main(String[] args) {
        final StringBuilder sb = new StringBuilder("Hello");
        sb.append(" World"); // Allowed: mutating internal state
        // sb = new StringBuilder("Reset"); // Compile Error: cannot reassign final variable
        System.out.println(sb);
    }
}`,
          interview: 'Q: Does a final object reference make the object immutable?\nA: No. A final reference prevents reassigning the variable to point to another object, but does not prevent mutating the internal state of the referenced object.'
        },
        {
          title: 'Garbage Collection Basics: Stack vs Heap Allocation',
          desc: 'Stack frames, Heap Eden/Survivor/Tenured spaces, and GC Root reachability.',
          content: 'Memory is divided into Stack (thread-specific execution frames holding local variables and return addresses) and Heap (shared memory storing all object instances). Objects become eligible for Garbage Collection when they are no longer reachable via any live GC Root (active thread stacks, static fields, JNI handles).',
          code: `public class GCReachability {
    public static void main(String[] args) {
        Object obj1 = new Object(); // Allocated on Heap
        Object obj2 = obj1;          // Two GC roots reference the same object
        obj1 = null;                 // Still reachable via obj2
        obj2 = null;                 // Object is now orphan and eligible for GC
    }
}`,
          interview: 'Q: What constitutes a GC Root in the JVM?\nA: Active thread stack local variables, static variables of loaded classes, JNI global and local references, and JVM internal system references.'
        }
      ]
    },
    3: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java Control Flow: Conditionals, Loops & Modern Switch Expressions',
      tasks: [
        {
          title: 'Conditionals: if-else Chains & Ternary Invariants',
          desc: 'Nested conditionals, short-circuit evaluation, and idiomatic guard clauses.',
          content: 'Control structures govern the execution path. Guard clauses return early from methods, reducing nesting depth and cognitive complexity. Ternary expressions `condition ? val1 : val2` provide concise value assignment.',
          code: `public class GuardClauseDemo {
    public double calculateDiscount(double price, int customerTier, boolean isHoliday) {
        if (price <= 0) return 0.0; // Guard clause
        if (customerTier >= 3) return price * 0.25;
        if (isHoliday) return price * 0.15;
        return price * 0.05;
    }
}`,
          interview: 'Q: Why are guard clauses preferred over deeply nested if-else statements?\nA: Guard clauses eliminate excessive indentation (arrow anti-pattern), validate preconditions upfront, and clarify the happy path.'
        },
        {
          title: 'Modern Java Switch Expressions & Pattern Matching',
          desc: 'Arrow syntax (->), yield keyword, multiple case labels, and exhaustive type matching in Java 17+.',
          content: 'Modern Java replaces error-prone fall-through switch statements with switch expressions using arrow syntax (`case X -> expression;`). Switch expressions return values, require no `break` statements, and enforce compiler exhaustiveness checking.',
          code: `public class ModernSwitchDemo {
    public enum Status { PENDING, PROCESSING, COMPLETED, FAILED }

    public String describeStatus(Status status) {
        return switch (status) {
            case PENDING -> "Waiting in queue";
            case PROCESSING -> {
                System.out.println("Processing active...");
                yield "In progress";
            }
            case COMPLETED -> "Task finished successfully";
            case FAILED -> "Task encountered error";
        };
    }
}`,
          interview: 'Q: What is the difference between traditional switch statement and switch expression in Java 17+?\nA: Switch expressions return a value, use arrow syntax without fall-through (no break needed), support the yield keyword in multi-line blocks, and enforce exhaustiveness.'
        },
        {
          title: 'Loops: for, enhanced for-each, while & do-while',
          desc: 'Index iteration, Iterable contract, loop invariants, and termination guarantees.',
          content: 'Standard `for` loop provides indexed traversal. The enhanced `for-each` loop iterates over any array or class implementing `java.lang.Iterable` using an underlying Iterator. `while` evaluates condition before execution; `do-while` guarantees at least one execution pass.',
          code: `import java.util.List;

public class LoopMechanics {
    public static void main(String[] args) {
        List<String> items = List.of("Alpha", "Beta", "Gamma");
        // Enhanced for loop compiles to Iterator usage
        for (String item : items) {
            System.out.println("Item: " + item);
        }
    }
}`,
          interview: 'Q: Can you modify a collection while iterating over it using an enhanced for-each loop?\nA: No, modifying the collection directly causes a ConcurrentModificationException because the underlying Iterator detects structural changes via modCount.'
        },
        {
          title: 'Jump Statements: break, continue & Labeled Loops',
          desc: 'Breaking out of nested loop matrices without boolean flags using labels.',
          content: '`break` terminates the innermost loop; `continue` skips to the next iteration. Labeled jump statements (`break labelName;`, `continue labelName;`) allow breaking or continuing an outer loop directly from within deeply nested loops.',
          code: `public class LabeledLoopMatrix {
    public static boolean searchMatrix(int[][] matrix, int target) {
        searchBlock:
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] == target) {
                    System.out.println("Found at [" + r + "][" + c + "]");
                    break searchBlock; // Exits both loops immediately
                }
            }
        }
        return true;
    }
}`,
          interview: 'Q: How do labeled break and continue statements work in Java?\nA: A label prefixes an outer loop. Invoking break or continue with the label identifier directs execution to terminate or continue that specific outer loop.'
        },
        {
          title: 'Performance & Optimization of Loop Structures',
          desc: 'Hoisting invariant computations, loop unrolling, and branch prediction impacts.',
          content: 'Loop performance is optimized by hoisting invariant calculations outside the loop body, sizing collections upfront to prevent dynamic resizing, and accessing multi-dimensional arrays in row-major order to maximize CPU L1/L2 cache locality.',
          code: `public class LoopOptimization {
    public long sumMatrixRowMajor(int[][] grid) {
        long sum = 0;
        int rows = grid.length;
        for (int r = 0; r < rows; r++) { // Row-major: cache-friendly
            int cols = grid[r].length;
            for (int c = 0; c < cols; c++) {
                sum += grid[r][c];
            }
        }
        return sum;
    }
}`,
          interview: 'Q: Why is row-major matrix traversal faster than column-major in Java?\nA: 2D arrays in Java are arrays of arrays stored contiguously by rows. Row-major access reads consecutive memory addresses loaded into CPU cache lines, minimizing cache misses.'
        }
      ]
    },
    4: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java Methods, Call Stack, Pass-by-Value Semantics & Recursion',
      tasks: [
        {
          title: 'Method Signatures, Return Types & Overloading',
          desc: 'Method name, parameter types, return covariance, and static method resolution.',
          content: 'A method signature consists of the method name and parameter type list (return type is NOT part of the signature). Method Overloading allows multiple methods in the same class to share a name with distinct parameter types, resolved at compile-time (static binding).',
          code: `public class MethodOverloadDemo {
    public int compute(int a, int b) { return a + b; }
    public double compute(double a, double b) { return a + b; }
    public String compute(String a, String b) { return a + b; }
}`,
          interview: 'Q: Is return type included in the Java method signature?\nA: No. The method signature comprises only the method name and parameter list. Having two methods differing only by return type results in a compile-time error.'
        },
        {
          title: 'Proving Java is Strictly Pass-by-Value',
          desc: 'Passing primitives by value vs passing object reference pointers by value.',
          content: 'In Java, ALL arguments are passed strictly by value. For primitive types, the actual binary value is copied. For objects, the copy of the memory reference (pointer) is passed: mutating fields through the reference affects the object on the heap, but reassigning the parameter reference variable has zero effect on the caller.',
          code: `public class PassByValueProof {
    static class Data { int value = 10; }

    static void modify(Data d) {
        d.value = 99; // Mutates heap object: caller sees 99
        d = new Data(); // Reassigns local pointer copy: caller unaffected
        d.value = 500;
    }

    public static void main(String[] args) {
        Data myData = new Data();
        modify(myData);
        System.out.println("Result: " + myData.value); // Prints 99, NOT 500
    }
}`,
          interview: 'Q: Is Java pass-by-reference or pass-by-value? Prove your answer.\nA: Java is 100% pass-by-value. When passing an object, Java passes a copy of the reference address. Reassigning the parameter reference does not alter the original reference in the calling stack frame.'
        },
        {
          title: 'Call Stack Execution, Stack Frames & StackOverflowError',
          desc: 'Stack frame push/pop lifecycle, local variable arrays, operand stack, and stack depth.',
          content: 'Every thread has a private JVM Stack. Each method call allocates a new Stack Frame containing: Local Variable Table, Operand Stack, Frame Data (constant pool reference), and Return Value. When recursive calls exceed the thread stack memory limit (-Xss), the JVM throws a StackOverflowError.',
          code: `public class StackTraceInspection {
    public static void stepA() { stepB(); }
    public static void stepB() {
        StackTraceElement[] frames = Thread.currentThread().getStackTrace();
        for (StackTraceElement frame : frames) {
            System.out.println(frame.getClassName() + "." + frame.getMethodName() + " (line " + frame.getLineNumber() + ")");
        }
    }
    public static void main(String[] args) { stepA(); }
}`,
          interview: 'Q: What is a StackOverflowError and how can it be diagnosed or prevented?\nA: It occurs when recursive calls or deep call chains exceed the thread stack size. Prevented by converting recursion to iterative loops or increasing stack size via -Xss.'
        },
        {
          title: 'Recursion Fundamentals & Base Case Invariants',
          desc: 'Divide-and-conquer recursion, base conditions, and transition relations.',
          content: 'Recursion solves problems by expressing the solution in terms of smaller subproblems. A valid recursive method must have: 1) One or more well-defined base cases that terminate without recursive calls, and 2) Recursive steps that strictly advance toward the base case.',
          code: `public class RecursionMath {
    public static long factorial(int n) {
        if (n <= 1) return 1; // Base case
        return n * factorial(n - 1); // Recursive transition
    }

    public static int fibonacci(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
          interview: 'Q: What are the risks of using naive recursion for Fibonacci calculation?\nA: Naive recursion causes exponential O(2^N) time complexity due to redundant recomputation of overlapping subproblems. Solved via memoization or iteration in O(N) time.'
        },
        {
          title: 'Tail Recursion vs Iterative Transformation',
          desc: 'Why Java lacks native Tail Call Optimization (TCO) and how to convert recursion to loops.',
          content: 'In tail recursion, the recursive call is the final operation in the function. Unlike compilers in functional languages (Scala, Haskell), standard HotSpot JVM does NOT perform automatic Tail Call Optimization (TCO) to preserve full stack trace visibility for security checks and debugging.',
          code: `public class TailRecursionToLoop {
    // Tail recursive concept
    public static long sumTail(int n, long accumulator) {
        if (n == 0) return accumulator;
        return sumTail(n - 1, accumulator + n);
    }

    // Iterative conversion (O(1) stack space in Java)
    public static long sumIterative(int n) {
        long acc = 0;
        while (n > 0) {
            acc += n--;
        }
        return acc;
    }
}`,
          interview: 'Q: Why does Java not support Tail Call Optimization (TCO) in HotSpot JVM?\nA: HotSpot preserves complete stack traces for security access control checks (SecurityManager/AccessController) and precise exception stack inspection.'
        }
      ]
    },
    5: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java Arrays: 1D, 2D Jagged Arrays, Memory Layout & System Operations',
      tasks: [
        {
          title: 'Array Instantiation, Length Property & Memory Layout',
          desc: 'Object header overhead, element stride, 0-indexed bounds checking, and ArrayIndexOutOfBoundsException.',
          content: 'In Java, arrays are true heap objects containing an 8-16 byte object header and a 4-byte `length` metadata field. Array elements are stored contiguously in memory, enabling O(1) random access calculated via `BaseAddress + (index * elementSize)`. All array bounds are checked at runtime by the JVM.',
          code: `public class ArrayAllocation {
    public static void main(String[] args) {
        int[] arr = new int[5]; // Allocated on heap with default 0s
        arr[0] = 10;
        arr[4] = 50;
        System.out.println("Array length: " + arr.length);
        System.out.println("Class representation: " + arr.getClass().getName()); // [I
    }
}`,
          interview: 'Q: Are arrays primitive types or reference types in Java?\nA: Arrays are reference types on the heap, inheriting directly from java.lang.Object and implementing Cloneable and java.io.Serializable.'
        },
        {
          title: '2D & Multi-Dimensional Jagged Arrays',
          desc: 'Array of arrays representation, non-uniform row lengths, and memory fragmentation.',
          content: 'Java does not have true multi-dimensional contiguous matrices; a 2D array `int[][]` is an array of object references pointing to independent 1D array instances on the heap. This allows "jagged arrays" where individual rows have differing lengths.',
          code: `public class JaggedArrayDemo {
    public static void main(String[] args) {
        int[][] triangle = new int[3][];
        triangle[0] = new int[1]; // Row 0 has 1 column
        triangle[1] = new int[2]; // Row 1 has 2 columns
        triangle[2] = new int[3]; // Row 2 has 3 columns

        triangle[0][0] = 1;
        triangle[1][0] = 2; triangle[1][1] = 3;
        triangle[2][0] = 4; triangle[2][1] = 5; triangle[2][2] = 6;
    }
}`,
          interview: 'Q: How are 2D arrays structured in Java memory compared to C/C++?\nA: C allocates 2D arrays as single contiguous flat memory blocks. Java allocates an array of reference pointers, each pointing to an independent 1D array object on the heap.'
        },
        {
          title: 'High-Performance Array Copying with System.arraycopy & Arrays.copyOf',
          desc: 'Native zero-copy memory transfers vs manual loop copying.',
          content: '`System.arraycopy()` is an intrinsic native method executed directly by the CPU using vector memory transfer instructions (memmove), significantly outperforming manual for-loop element copying. `Arrays.copyOf()` internally wraps System.arraycopy while allocating a new destination array.',
          code: `import java.util.Arrays;

public class NativeArrayCopy {
    public static void main(String[] args) {
        int[] src = {10, 20, 30, 40, 50};
        int[] dest = new int[5];

        // Native hardware-accelerated memory block copy
        System.arraycopy(src, 0, dest, 0, src.length);
        System.out.println("Copied Array: " + Arrays.toString(dest));

        // Resize array dynamically using Arrays.copyOf
        int[] expanded = Arrays.copyOf(src, 10);
        System.out.println("Expanded Array: " + Arrays.toString(expanded));
    }
}`,
          interview: 'Q: Why is System.arraycopy faster than a standard Java for-loop?\nA: It is an intrinsic JVM method mapped directly to low-level native assembly (memmove) instructions that leverage SIMD and CPU block memory copying.'
        },
        {
          title: 'Utility Methods: Arrays.sort, Arrays.binarySearch & Deep Equality',
          desc: 'Dual-Pivot Quicksort for primitives, Timsort for objects, and deepEquals for multidimensional arrays.',
          content: '`java.util.Arrays.sort()` uses Dual-Pivot Quicksort (Vladimir Yaroslavskiy) for primitive arrays achieving O(N log N) average performance, and Timsort (hybrid merge-insertion sort) for object arrays ensuring stable sorting. `Arrays.deepEquals()` compares nested multi-dimensional arrays recursively.',
          code: `import java.util.Arrays;

public class ArraysUtilityDemo {
    public static void main(String[] args) {
        int[] data = {45, 12, 85, 32, 89, 39, 69, 44};
        Arrays.sort(data); // Dual-Pivot Quicksort
        int idx = Arrays.binarySearch(data, 39);
        System.out.println("Found 39 at sorted index: " + idx);

        int[][] grid1 = {{1, 2}, {3, 4}};
        int[][] grid2 = {{1, 2}, {3, 4}};
        System.out.println("Deep equals: " + Arrays.deepEquals(grid1, grid2)); // true
    }
}`,
          interview: 'Q: What sorting algorithms are used by Arrays.sort() for primitives vs objects?\nA: Dual-Pivot Quicksort for primitives (fast, in-place, unstable) and Timsort for objects (stable, adaptive O(N log N)).'
        },
        {
          title: 'Array Immutability Patterns & Defensive Copying',
          desc: 'Preventing rep exposure by returning clones or defensive copies from getters.',
          content: 'Arrays are inherently mutable; declaring a final array field `final int[] data` only prevents reassigning the array variable, not modifying elements. To prevent representation exposure, classes must clone or defensively copy arrays in constructors and getters.',
          code: `public final class ImmutableRecord {
    private final int[] values;

    public ImmutableRecord(int[] input) {
        // Defensive copy on input
        this.values = (input != null) ? input.clone() : new int[0];
    }

    public int[] getValues() {
        // Defensive copy on output prevents external mutation
        return values.clone();
    }
}`,
          interview: 'Q: What is defensive copying and why is it necessary for array fields?\nA: Defensive copying creates a clone of the array during initialization and return to prevent external callers from mutating private internal state.'
        }
      ]
    },
    6: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java String Mechanics, String Pool, Immutability & StringBuilder',
      tasks: [
        {
          title: 'String Immutability & The String Constant Pool',
          desc: 'Why Strings are immutable and final, heap String Pool caching, and `intern()` mechanics.',
          content: '`java.lang.String` is an immutable, final class. String literals are stored in the String Constant Pool inside heap memory. If a literal exists, the JVM reuses the existing reference. Immutability guarantees thread safety, security for network/database URLs, caching of hash codes, and String pool deduplication.',
          code: `public class StringPoolInternals {
    public static void main(String[] args) {
        String s1 = "Mastery"; // Stored in String Constant Pool
        String s2 = "Mastery"; // Reuses pool reference
        String s3 = new String("Mastery"); // Allocated on Heap outside pool

        System.out.println("s1 == s2: " + (s1 == s2)); // true (same pool reference)
        System.out.println("s1 == s3: " + (s1 == s3)); // false (different heap objects)
        System.out.println("s1 == s3.intern(): " + (s1 == s3.intern())); // true (interned to pool)
    }
}`,
          interview: 'Q: Why is String immutable in Java?\nA: For 1) Security (passwords/network URLs cannot be altered), 2) Thread safety (safe sharing without synchronization), 3) String Constant Pool caching, and 4) HashCode caching for instant map lookups.'
        },
        {
          title: 'String Concatenation Mechanics & Bytecode Transformation',
          desc: 'How the `+` operator compiles to StringBuilder or invokedynamic StringConcatFactory in Java 9+.',
          content: 'Concatenating strings using `+` inside a loop creates a new StringBuilder and intermediate String instance on every iteration, causing O(N^2) memory allocations and GC thrashing. Outside loops, Java 9+ compiles `+` into `invokedynamic` calling `StringConcatFactory.makeConcatWithConstants()` for optimized JVM-level assembly.',
          code: `public class ConcatenationBenchmark {
    // ANTI-PATTERN: O(N^2) allocations
    public static String badConcat(int count) {
        String result = "";
        for (int i = 0; i < count; i++) {
            result += i; // Recreates new StringBuilder every iteration
        }
        return result;
    }

    // OPTIMAL: Single O(N) allocation
    public static String optimalConcat(int count) {
        StringBuilder sb = new StringBuilder(count * 4);
        for (int i = 0; i < count; i++) {
            sb.append(i);
        }
        return sb.toString();
    }
}`,
          interview: 'Q: Why should you avoid string concatenation (+) inside loops?\nA: Because each iteration creates a new StringBuilder and String object, converting an O(N) operation into an O(N^2) performance and memory disaster.'
        },
        {
          title: 'StringBuilder vs StringBuffer Internals & Buffer Resizing',
          desc: 'Unsynchronized dynamic byte arrays vs synchronized thread-safe buffers with 2x capacity growth.',
          content: '`StringBuilder` (unsynchronized, faster) and `StringBuffer` (synchronized, thread-safe) manage an internal byte[] array (Compact Strings in Java 9+). When capacity is exceeded, the internal buffer grows automatically: `newCapacity = (oldCapacity * 2) + 2`. Pre-sizing capacity prevents repeated allocations.',
          code: `public class BufferCapacityDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder(10); // Initial capacity = 10
        System.out.println("Initial Capacity: " + sb.capacity() + ", Length: " + sb.length());
        sb.append("0123456789A"); // Exceeds 10 -> grows to (10 * 2) + 2 = 22
        System.out.println("Resized Capacity: " + sb.capacity() + ", Length: " + sb.length());
    }
}`,
          interview: 'Q: What is the difference between StringBuilder and StringBuffer?\nA: StringBuffer is synchronized and thread-safe at the cost of synchronization overhead. StringBuilder is unsynchronized, faster, and preferred for single-threaded operations.'
        },
        {
          title: 'Compact Strings (Java 9+) & UTF-16 Character Encoding',
          desc: 'LATIN1 (1 byte per char) vs UTF16 (2 bytes per char) memory optimization in HotSpot.',
          content: 'Prior to Java 9, String stored characters as `char[]` consuming 2 bytes per character regardless of content. Java 9 introduced Compact Strings: strings store `byte[]` with a `coder` flag (LATIN1 = 0 for ISO-8859-1 storing 1 byte/char; UTF16 = 1 storing 2 bytes/char), slashing heap memory consumption of strings by up to 50%.',
          code: `public class CompactStringsInspector {
    public static void main(String[] args) {
        String ascii = "Hello World"; // Uses LATIN1 encoding (1 byte per char)
        String unicode = "Hello \uD83D\uDE00"; // Contains emoji: UTF-16 encoding (2 bytes per char)
        System.out.println("ASCII length: " + ascii.length());
        System.out.println("Unicode code point count: " + unicode.codePointCount(0, unicode.length()));
    }
}`,
          interview: 'Q: How does Compact Strings in Java 9+ reduce memory footprint?\nA: It stores characters in a byte[] array instead of char[]. If all characters fit in Latin-1 (ISO-8859-1), it allocates 1 byte per character instead of 2 bytes.'
        },
        {
          title: 'High-Frequency String Manipulation Algorithms',
          desc: 'Tokenization, regex splits, substring memory sharing vs copying, and palindrome testing.',
          content: 'Key String API operations include `split()`, `indexOf()`, `strip()` (Unicode-aware trimming in Java 11+), and `repeat()`. In modern Java, `substring()` creates a brand-new String copy to avoid memory leaks from retaining large parent character arrays.',
          code: `public class StringAlgorithms {
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`,
          interview: 'Q: What is the difference between String.trim() and String.strip() in Java 11?\nA: trim() only removes characters <= U+0020 (ASCII space). strip() is Unicode-aware and strips all Unicode whitespace according to Character.isWhitespace().'
        }
      ]
    },
    7: {
      week: 1, track: 'java', topic: 'Java Foundations', title: 'Java Control Flow & Memory Checkpoint: Building a CLI Data Processing Engine',
      tasks: [
        {
          title: 'Designing the CLI Data Processor Architecture',
          desc: 'Structuring modular CLI classes, argument parsing, error validation, and clean separation of concerns.',
          content: 'Synthesizing Week 1 foundations: build a modular command-line application that parses structured CSV/JSON data, validates primitive bounds, executes calculations, and prints formatted reports.',
          code: `package com.mastery.cli;

public class DataEngineConfig {
    private final String inputPath;
    private final int batchSize;

    public DataEngineConfig(String inputPath, int batchSize) {
        this.inputPath = inputPath;
        this.batchSize = (batchSize > 0) ? batchSize : 100;
    }
    public String getInputPath() { return inputPath; }
    public int getBatchSize() { return batchSize; }
}`,
          interview: 'Q: How do you structure a maintainable command-line application in Java?\nA: Separate configuration parsing, business validation, data transformations, and output formatting into distinct classes.'
        },
        {
          title: 'Buffered I/O & Efficient Data Streaming',
          desc: 'BufferedReader, Scanner, try-with-resources, and character stream processing.',
          content: '`BufferedReader` reads text from a character-input stream, buffering characters to provide efficient reading of characters, arrays, and lines (default buffer 8KB), outperforming `Scanner` by 10x-50x on large inputs.',
          code: `import java.io.BufferedReader;
import java.io.StringReader;

public class FastIOReader {
    public static void processStream(String data) throws Exception {
        try (BufferedReader br = new BufferedReader(new StringReader(data))) {
            String line;
            long lineCount = 0;
            while ((line = br.readLine()) != null) {
                lineCount++;
            }
            System.out.println("Processed " + lineCount + " lines.");
        }
    }
}`,
          interview: 'Q: Why is BufferedReader significantly faster than Scanner for reading large data?\nA: Scanner performs regex parsing and tokenization on every read. BufferedReader reads large memory blocks (8KB) directly without tokenization overhead.'
        },
        {
          title: 'Memory Benchmarking & GC Telemetry',
          desc: 'Measuring heap allocation rates, tracking GC pauses, and verifying zero memory leaks.',
          content: 'Monitoring memory consumption using `Runtime.getRuntime()` and Java Flight Recorder (JFR) to ensure batch operations create minimal garbage and allow prompt heap reclamation.',
          code: `public class MemoryBenchmark {
    public static void reportMemory(String checkpoint) {
        Runtime rt = Runtime.getRuntime();
        long used = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
        System.out.printf("[%s] Heap Used: %d MB%n", checkpoint, used);
    }
}`,
          interview: 'Q: How can you programmatically monitor JVM memory usage during execution?\nA: Using Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory() or MemoryMXBean via ManagementFactory.getMemoryMXBean().'
        },
        {
          title: 'Defensive Programming & Input Validation',
          desc: 'Enforcing numeric bounds, guarding against nulls, and custom exit codes.',
          content: 'Robust software validates inputs at system boundaries. Numeric strings must be validated before parsing to prevent NumberFormatException; out-of-range arguments must fail gracefully with descriptive error codes.',
          code: `public class InputValidator {
    public static int parsePositiveInt(String value, String fieldName) {
        try {
            int num = Integer.parseInt(value);
            if (num <= 0) throw new IllegalArgumentException(fieldName + " must be > 0");
            return num;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid integer for " + fieldName + ": " + value);
        }
    }
}`,
          interview: 'Q: When should you validate method arguments and what exception types should you throw?\nA: Validate at public method boundaries; throw IllegalArgumentException for invalid values, NullPointerException for unexpected nulls, and IllegalStateException for invalid object state.'
        },
        {
          title: 'Week 1 Synthesis: Executing the Full CLI Pipeline',
          desc: 'Running the complete data analytics engine end-to-end with unit tests.',
          content: 'End-to-end integration of control flow, array processing, string manipulation, and error handling into a fully functional CLI pipeline with automated test assertions.',
          code: `public class PipelineRunner {
    public static void main(String[] args) {
        System.out.println("=== Java Foundations Mastery Engine Initialized ===");
        System.out.println("Status: All 7 days of Week 1 core invariants verified.");
    }
}`,
          interview: 'Q: What are the key takeaways from Week 1 Java Foundations?\nA: Strict pass-by-value semantics, JVM memory model (stack vs heap), String immutability, efficient loop/memory patterns, and modern switch expressions.'
        }
      ]
    },

    // Week 2 (Days 8-14): Java OOP: Classes, Encapsulation, Inheritance & Polymorphism
    8: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'Classes, Objects, Heap Memory Layout & Constructor Chaining',
      tasks: [
        {
          title: 'Classes as Blueprints & Heap Object Allocation',
          desc: 'Object Header layout (Mark Word, Klass Word), 8-byte alignment, and heap footprint.',
          content: 'An object on the HotSpot 64-bit JVM consists of: 1) Mark Word (8 bytes: hash code, GC age, lock flags), 2) Klass Word (4-8 bytes pointer to class metadata in Metaspace), 3) Instance Fields, and 4) Padding (aligned to multiples of 8 bytes). `new` allocates memory, initializes fields, executes constructor, and returns pointer reference.',
          code: `public class ObjectHeaderDemo {
    private int id;        // 4 bytes
    private boolean active;// 1 byte
    // 3 bytes padding + 12-16 byte header = 24 bytes total on heap
}`,
          interview: 'Q: What is the structure of an object in JVM heap memory?\nA: Mark Word (GC/locking metadata), Klass pointer (Metaspace class metadata), instance field data, and alignment padding to 8-byte boundaries.'
        },
        {
          title: 'Constructors, Overloading & Constructor Chaining via `this()`',
          desc: 'Default no-arg constructor, parameterized constructors, and `this()` chaining.',
          content: 'Constructors initialize newly created objects. Constructor chaining using `this(args...)` allows secondary constructors to delegate initialization to a master constructor, eliminating duplicated initialization logic. `this()` MUST be the very first statement in a constructor body.',
          code: `public class UserAccount {
    private final String username;
    private final String email;
    private final int tier;

    public UserAccount(String username, String email) {
        this(username, email, 1); // Delegate to master constructor
    }

    public UserAccount(String username, String email, int tier) {
        this.username = username;
        this.email = email;
        this.tier = tier;
    }
}`,
          interview: 'Q: Why must this() or super() be the first statement in a constructor?\nA: To ensure the superclass and object invariants are completely initialized before any child instance logic executes.'
        },
        {
          title: 'The `this` Keyword & Instance Context',
          desc: 'Disambiguating shadowed fields, method chaining (fluent interface), and passing current instance.',
          content: 'The `this` keyword is an implicit reference variable pointing to the current object executing an instance method or constructor. Used to disambiguate shadowed instance variables, invoke instance methods, pass the current instance to listeners, or implement fluent builder APIs.',
          code: `public class FluentBuilder {
    private String name;
    private int score;

    public FluentBuilder withName(String name) {
        this.name = name; // Disambiguate field
        return this;     // Method chaining
    }

    public FluentBuilder withScore(int score) {
        this.score = score;
        return this;
    }
}`,
          interview: 'Q: What is the primary use of returning `this` from a method?\nA: It enables fluent API design (method chaining) where multiple calls can be chained together sequentially (e.g. StringBuilder.append().append()).'
        },
        {
          title: 'Static Members, Static Initializer Blocks & Class Loading',
          desc: 'Class-level state, static methods, static initialization blocks `<clinit>`, and thread safety.',
          content: 'Static fields belong to the `Class<T>` object stored in Metaspace, shared across all instances. Static initialization blocks `static { ... }` execute once when the JVM ClassLoader loads and initializes the class, guaranteed to be thread-safe by the JVM class-loading lock.',
          code: `public class StaticInitDemo {
    public static final String API_ENDPOINT;

    static {
        // Runs once when class is loaded into Metaspace
        String env = System.getenv("API_URL");
        API_ENDPOINT = (env != null) ? env : "https://api.masteryhub.dev";
        System.out.println("Static initialization complete: " + API_ENDPOINT);
    }
}`,
          interview: 'Q: When does a static initialization block execute in Java?\nA: Exactly once when the class is first loaded and initialized by the JVM ClassLoader, before any instance creation or static method call.'
        },
        {
          title: 'Object Destruction, finalize() Deprecation & Cleaners',
          desc: 'Why finalize() is deprecated and how to use java.lang.ref.Cleaner / try-with-resources.',
          content: '`Object.finalize()` is permanently deprecated due to unpredictable timing, performance overhead, thread starvation, and object resurrection bugs. Modern Java uses `AutoCloseable` with try-with-resources or `java.lang.ref.Cleaner` for safe off-heap resource deallocation.',
          code: `import java.lang.ref.Cleaner;

public class SafeResource implements AutoCloseable {
    private static final Cleaner cleaner = Cleaner.create();
    private final Cleaner.Cleanable cleanable;

    public SafeResource() {
        this.cleanable = cleaner.register(this, () -> System.out.println("Off-heap resource deallocated."));
    }

    @Override
    public void close() {
        cleanable.clean();
    }
}`,
          interview: 'Q: Why is finalize() deprecated and what should be used instead?\nA: finalize() has unpredictable execution timing, swallows exceptions, and causes performance degradation. Use AutoCloseable with try-with-resources or java.lang.ref.Cleaner instead.'
        }
      ]
    },
    9: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'OOP Pillar 1: Encapsulation, Access Modifiers & JavaBeans/POJO Architecture',
      tasks: [
        {
          title: 'Encapsulation Principles & Invariant Protection',
          desc: 'Hiding internal state, exposing controlled interfaces, and enforcing business rules.',
          content: 'Encapsulation binds data and the methods operating on that data together into a single unit (class), hiding internal representation (information hiding). It ensures object state cannot be corrupted by external direct access, enforcing validation invariants via accessors and mutators.',
          code: `public class BankAccount {
    private double balance; // Encapsulated private state

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive");
        this.balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0 || amount > balance) throw new IllegalArgumentException("Invalid withdrawal amount");
        this.balance -= amount;
    }

    public double getBalance() { return balance; }
}`,
          interview: 'Q: What is encapsulation and why is it fundamental to object-oriented software?\nA: Encapsulation shields internal object state, preventing unauthorized direct mutation, allowing internal implementation changes without breaking client code, and maintaining strict invariants.'
        },
        {
          title: 'Access Modifiers: private, default, protected & public',
          desc: 'Four levels of visibility across classes, packages, subclasses, and external modules.',
          content: 'Java defines 4 access levels: 1) `private`: visible only within the declaring class; 2) `default` (package-private, no modifier): visible within the same package; 3) `protected`: visible within the same package AND by subclasses in other packages; 4) `public`: visible everywhere.',
          code: `package com.mastery.security;

public class AccessTable {
    private int privateField;     // Class only
    int packagePrivateField;      // Package only
    protected int protectedField; // Package + Subclasses
    public int publicField;       // Universal access
}`,
          interview: 'Q: What is the visibility difference between default (package-private) and protected?\nA: Default allows access only within the same package. Protected allows access within the same package PLUS subclasses in different packages.'
        },
        {
          title: 'JavaBeans Convention, POJOs & DTOs',
          desc: 'No-arg constructor, private fields, getter/setter naming conventions, and serialization.',
          content: 'A Plain Old Java Object (POJO) is a standard class with no framework dependencies. A JavaBean adheres to conventions: public no-arg constructor, private properties accessed via `getX()` / `setX()`, and implements `Serializable`. Data Transfer Objects (DTOs) carry data between application layers.',
          code: `public class StudentDTO implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String fullName;

    public StudentDTO() {} // No-arg constructor
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}`,
          interview: 'Q: What is the difference between a POJO, a JavaBean, and a DTO?\nA: POJO is any simple Java object. JavaBean follows strict conventions (no-arg constructor, getters/setters, Serializable). DTO is a specialized object designed specifically to transfer data between process layers without business logic.'
        },
        {
          title: 'Immutability in OOP: Creating True Immutable Classes',
          desc: 'Final class, private final fields, defensive copying in constructors and accessors.',
          content: 'To make a class truly immutable: 1) Declare class as `final` (prevents subclassing), 2) Make all fields `private final`, 3) Provide no setters, 4) Initialize all fields via constructor using defensive copies for mutable objects, 5) Return defensive copies or unmodifiable wrappers in getters.',
          code: `import java.util.Date;

public final class ImmutableTransaction {
    private final String txId;
    private final Date timestamp; // Mutable object!

    public ImmutableTransaction(String txId, Date timestamp) {
        this.txId = txId;
        this.timestamp = (timestamp != null) ? new Date(timestamp.getTime()) : null; // Defensive copy
    }

    public String getTxId() { return txId; }
    public Date getTimestamp() {
        return (timestamp != null) ? new Date(timestamp.getTime()) : null; // Defensive copy
    }
}`,
          interview: 'Q: What are the 5 rules for creating an immutable class in Java?\nA: 1) Class is final, 2) All fields are private and final, 3) No setter mutators, 4) Defensive copies on mutable inputs in constructors, 5) Defensive copies on mutable outputs in getters.'
        },
        {
          title: 'Value Objects & Domain-Driven Design (DDD)',
          desc: 'Entities with identity vs Value Objects defined solely by attributes.',
          content: 'In Domain-Driven Design (DDD), an Entity possesses a unique identity (e.g., UserId) that persists across mutations. A Value Object has no distinct identity; its identity is defined solely by its field values (e.g., Money: amount + currency), making it naturally immutable.',
          code: `public final class Money {
    private final double amount;
    private final String currency;

    public Money(double amount, String currency) {
        if (amount < 0 || currency == null) throw new IllegalArgumentException("Invalid money parameters");
        this.amount = amount;
        this.currency = currency;
    }

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) throw new IllegalArgumentException("Currency mismatch");
        return new Money(this.amount + other.amount, this.currency);
    }
}`,
          interview: 'Q: What is the difference between an Entity and a Value Object in software design?\nA: An Entity is defined by a unique identifier (ID) and mutates over time. A Value Object is defined purely by its attribute values and is immutable.'
        }
      ]
    },
    10: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'OOP Pillar 2: Inheritance, Method Overriding, `super` & Dynamic Dispatch',
      tasks: [
        {
          title: 'Inheritance & IS-A Relationships',
          desc: 'Code reuse, class hierarchies using `extends`, and single inheritance limitations.',
          content: 'Inheritance allows a subclass to inherit non-private fields and methods from a superclass, modeling an IS-A relationship (e.g., `Dog extends Animal`). Java supports single inheritance of classes (a class can extend exactly one direct superclass) to eliminate the C++ diamond problem.',
          code: `public class Animal {
    protected String species;
    public Animal(String species) { this.species = species; }
    public void eat() { System.out.println(species + " is eating."); }
}

public class Dog extends Animal {
    public Dog() { super("Canine"); }
    public void bark() { System.out.println("Woof!"); }
}`,
          interview: 'Q: Why does Java not support multiple class inheritance?\nA: To avoid the Diamond Problem (ambiguity when two parent classes define the same method with different implementations) and keep the language design simple and predictable.'
        },
        {
          title: 'The `super` Keyword: Constructors & Superclass Methods',
          desc: 'Calling superclass constructors `super(...)` and invoking overridden methods `super.method()`.',
          content: 'The `super` keyword refers directly to the immediate superclass. `super()` invokes the superclass constructor and must be the first line of the child constructor. `super.methodName()` allows an overriding subclass method to invoke the original parent implementation.',
          code: `public class Employee {
    protected double baseSalary;
    public Employee(double salary) { this.baseSalary = salary; }
    public double calculatePay() { return baseSalary; }
}

public class Manager extends Employee {
    private double bonus;
    public Manager(double salary, double bonus) {
        super(salary); // Invoke Employee constructor
        this.bonus = bonus;
    }
    @Override
    public double calculatePay() {
        return super.calculatePay() + bonus; // Invoke parent method
    }
}`,
          interview: 'Q: What happens if a superclass does not define a no-argument constructor?\nA: The subclass constructor must explicitly call super(args...) with matching arguments as its first line; otherwise, the compiler fails with an error.'
        },
        {
          title: 'Method Overriding & The `@Override` Annotation',
          desc: 'Signature matching, covariance of return types, access visibility expansion, and exception rules.',
          content: 'Method Overriding occurs when a subclass provides a specific implementation of a method declared in its superclass. Rules: 1) Same name and parameter types, 2) Return type must be identical or covariant (subtype), 3) Access modifier cannot be more restrictive, 4) Cannot throw new or broader checked exceptions.',
          code: `public class Shape {
    public Shape cloneShape() throws Exception { return new Shape(); }
}

public class Circle extends Shape {
    @Override
    public Circle cloneShape() { // Covariant return type (Circle is Shape) and narrower exception
        return new Circle();
    }
}`,
          interview: 'Q: What are the 4 rules of method overriding in Java?\nA: 1) Identical method signature, 2) Covariant (same or subtype) return type, 3) Same or broader access visibility (cannot reduce visibility), 4) Cannot declare new/broader checked exceptions.'
        },
        {
          title: 'Dynamic Method Dispatch & The Virtual Method Table (vtable)',
          desc: 'How the JVM resolves overridden methods at runtime using `invokevirtual` and vtables.',
          content: 'Dynamic Method Dispatch is the runtime mechanism by which an overridden method call is resolved at runtime rather than compile-time. The JVM compiler emits the `invokevirtual` bytecode instruction. At runtime, the JVM inspects the object Klass vtable to find the target method address.',
          code: `public class DispatchDemo {
    public static void main(String[] args) {
        Animal pet = new Dog(); // Reference of type Animal, Object of type Dog
        pet.eat(); // Dynamic dispatch: executes Dog's overridden eat() at runtime
    }
}`,
          interview: 'Q: How does the JVM implement Dynamic Method Dispatch under the hood?\nA: The JVM builds a Virtual Method Table (vtable) for each loaded class containing pointers to executable method code. invokevirtual performs an indexed lookup in the object vtable at runtime.'
        },
        {
          title: 'Composition vs Inheritance: Clean Architecture',
          desc: 'Why "Favor Composition over Inheritance" prevents fragile base class coupling.',
          content: 'Inheritance creates tight compile-time coupling (white-box reuse) that can break subclass invariants when superclasses change. Composition (HAS-A relationship) embeds dependencies as private member fields, delegating operations cleanly and enabling easy mocking and runtime polymorphism.',
          code: `// Preferred: Composition over Inheritance
public class OrderService {
    private final PaymentProcessor paymentProcessor; // Injected dependency
    private final NotificationService notifier;

    public OrderService(PaymentProcessor paymentProcessor, NotificationService notifier) {
        this.paymentProcessor = paymentProcessor;
        this.notifier = notifier;
    }
}`,
          interview: 'Q: Why is composition generally favored over class inheritance in enterprise Java?\nA: Composition reduces tight coupling, prevents the fragile base class problem, allows dynamic behavior swapping at runtime, and enables straightforward unit testing with mock dependencies.'
        }
      ]
    },
    11: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'OOP Pillar 3 & 4: Polymorphism, Abstraction, Abstract Classes & Interfaces',
      tasks: [
        {
          title: 'Compile-Time (Static) vs Runtime (Dynamic) Polymorphism',
          desc: 'Method overloading vs method overriding, early binding vs late binding.',
          content: 'Polymorphism ("many forms") allows objects of different types to be treated through a common interface. Compile-time polymorphism is achieved via method overloading (static binding by compiler). Runtime polymorphism is achieved via method overriding and interface implementation (late dynamic binding by JVM).',
          code: `public class PolymorphismDemo {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(), new Rectangle());
        for (Shape s : shapes) {
            s.draw(); // Polymorphic invocation
        }
    }
}`,
          interview: 'Q: What is the core difference between static polymorphism and dynamic polymorphism?\nA: Static polymorphism (overloading) is resolved at compile-time by compiler signature matching. Dynamic polymorphism (overriding) is resolved at runtime by JVM based on actual object heap type.'
        },
        {
          title: 'Abstract Classes: Partial Implementation & Template Method Pattern',
          desc: 'Abstract methods, non-abstract helper methods, constructors in abstract classes, and state.',
          content: 'An abstract class (`abstract class`) cannot be instantiated directly and can contain both abstract methods (without body) and fully implemented concrete methods, as well as instance state variables and constructors. Ideal for base classes sharing state and the Template Method design pattern.',
          code: `public abstract class DataParser {
    // Template method defining algorithm skeleton
    public final void parseFile(String path) {
        openFile(path);
        readData();
        closeFile();
    }
    protected abstract void readData(); // Subclasses implement specific parsing
    private void openFile(String p) { System.out.println("Opening: " + p); }
    private void closeFile() { System.out.println("Closed file."); }
}`,
          interview: 'Q: Can an abstract class have constructors if it cannot be instantiated?\nA: Yes. Abstract class constructors are called via super() from subclass constructors to initialize superclass fields and enforce base invariants.'
        },
        {
          title: 'Interfaces: Contracts, Default Methods & Static Methods',
          desc: 'Pure behavioral contracts, default methods (Java 8+), static helpers, and private interface methods.',
          content: 'An interface defines a public behavioral contract. Since Java 8, interfaces can provide default method implementations (`default void doWork()`) for backward compatibility, static utility methods, and private helper methods (Java 9+). A class can implement multiple interfaces, achieving multiple inheritance of type.',
          code: `public interface Auditable {
    String getAuditId();

    default void logAudit() { // Default method with implementation
        System.out.println("Audit timestamp: " + System.currentTimeMillis() + ", ID: " + getAuditId());
    }

    static boolean isValid(Auditable item) { // Static interface method
        return item != null && item.getAuditId() != null;
    }
}`,
          interview: 'Q: Why were default methods introduced to interfaces in Java 8?\nA: To enable interface evolution (adding new methods to existing interfaces like Collection.stream() and forEach()) without breaking thousands of existing implementing classes.'
        },
        {
          title: 'Resolving the Multiple Interface Diamond Problem',
          desc: 'Handling conflicting default methods across implemented interfaces using `InterfaceName.super.method()`.',
          content: 'When a class implements two interfaces defining identical default method signatures, the compiler detects an ambiguity error. The implementing class MUST override the conflicting method and explicitly specify which interface default implementation to call via `InterfaceA.super.method()`.',
          code: `interface ServiceA {
    default void execute() { System.out.println("ServiceA execution"); }
}
interface ServiceB {
    default void execute() { System.out.println("ServiceB execution"); }
}

public class MultiService implements ServiceA, ServiceB {
    @Override
    public void execute() {
        ServiceA.super.execute(); // Explicitly resolve conflict
        System.out.println("MultiService customized execution");
    }
}`,
          interview: 'Q: How does Java resolve the Diamond Problem when implementing two interfaces with identical default methods?\nA: The compiler forces the implementing class to explicitly override the conflicting method and choose an implementation using InterfaceName.super.methodName() or provide its own logic.'
        },
        {
          title: 'Abstract Class vs Interface: Architectural Decision Matrix',
          desc: 'When to choose an abstract class (shared state/lifecycle) vs interface (decoupled contracts).',
          content: 'Choose an Abstract Class when: 1) Sharing non-static state fields across closely related classes, 2) Requiring non-public access modifiers (protected/package-private), 3) Implementing template method lifecycles. Choose an Interface when: 1) Defining behavioral contracts across unrelated classes, 2) Needing multiple inheritance of types.',
          code: `// Interface contract across unrelated domains
public interface Exportable {
    byte[] exportToPdf();
}

// Abstract base class for related domain entities
public abstract class BaseEntity {
    protected Long id;
    protected Long createdAt = System.currentTimeMillis();
}`,
          interview: 'Q: What are the main architectural criteria for choosing an abstract class vs an interface?\nA: Use abstract classes for closely related hierarchies requiring shared mutable state or protected methods; use interfaces for decoupled, polymorphic behavioral capabilities implemented across unrelated classes.'
        }
      ]
    },
    12: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'The `Object` Class Masterclass: equals(), hashCode(), toString() & clone()',
      tasks: [
        {
          title: 'The java.lang.Object Class Hierarchy & Default Methods',
          desc: 'Universal root class, 11 built-in methods, and identity vs value semantics.',
          content: '`java.lang.Object` is the root superclass of every class in Java. It defines 11 methods: `equals()`, `hashCode()`, `toString()`, `getClass()`, `clone()`, `finalize()`, and concurrency methods `wait()`, `notify()`, `notifyAll()`. By default, `equals()` performs reference equality `this == obj`.',
          code: `public class ObjectDemo {
    public static void main(String[] args) {
        Object a = new Object();
        Object b = new Object();
        System.out.println("Default equals: " + a.equals(b)); // false
        System.out.println("Default toString: " + a.toString()); // Object@15db9742
    }
}`,
          interview: 'Q: What does the default implementation of equals() in java.lang.Object do?\nA: It performs reference identity comparison (this == obj), returning true only if both reference pointers point to the exact same object in memory.'
        },
        {
          title: 'The equals() and hashCode() Contract',
          desc: 'Reflexive, Symmetric, Transitive, Consistent, and Null-comparison rules, plus hash bucket consistency.',
          content: 'The equals-hashCode contract mandates: 1) If `a.equals(b)` is true, `a.hashCode() == b.hashCode()` MUST be true; 2) If `a.hashCode() == b.hashCode()`, `a.equals(b)` does not need to be true (hash collision). Violating this contract corrupts hash-based collections (HashMap, HashSet).',
          code: `import java.util.Objects;

public class EmployeeKey {
    private final int id;
    private final String department;

    public EmployeeKey(int id, String department) {
        this.id = id;
        this.department = department;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true; // Reflexive optimization
        if (o == null || getClass() != o.getClass()) return false;
        EmployeeKey that = (EmployeeKey) o;
        return id == that.id && Objects.equals(department, that.department);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, department); // Must match equals fields
    }
}`,
          interview: 'Q: Why MUST you override hashCode() whenever you override equals()?\nA: Because HashMap and HashSet use hashCode() to locate the storage bucket. If two equal objects produce different hashCodes, the collection fails to retrieve or deduplicate the object.'
        },
        {
          title: 'Writing Idiomatic toString() & Debugging Representation',
          desc: 'Formatting JSON-like string outputs, omitting sensitive passwords/secrets, and IDE generation.',
          content: 'The default `toString()` outputs `ClassName@HexHashCode`. Overriding `toString()` provides readable debugging and logging output. Sensitive data like passwords, credit card numbers, and API tokens must be explicitly excluded to prevent log security vulnerabilities.',
          code: `public class UserProfile {
    private final String userId;
    private final String email;
    private final String passwordHash; // SENSITIVE

    public UserProfile(String userId, String email, String hash) {
        this.userId = userId; this.email = email; this.passwordHash = hash;
    }

    @Override
    public String toString() {
        return "UserProfile{" + "userId='" + userId + '\'' + ", email='" + email + '\'' + '}'; // passwordHash excluded
    }
}`,
          interview: 'Q: What is the primary purpose of toString() and what security consideration must be kept in mind?\nA: toString() provides clear debugging and logging representations; developers must never include sensitive data (passwords, tokens) to prevent security leaks in production logs.'
        },
        {
          title: 'Cloning Mechanics: Cloneable Interface vs Copy Constructors',
          desc: 'Shallow copy vs deep copy, Object.clone() protected access, and why Copy Constructors are superior.',
          content: '`Object.clone()` creates a shallow bitwise copy of an object if it implements the marker interface `Cloneable`; otherwise throws `CloneNotSupportedException`. Copy constructors (`new Person(existingPerson)`) and static factory copy methods are strongly preferred because they avoid un-checked exceptions, reflection, and bypass of standard constructors.',
          code: `public class Point {
    private final int x, y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    // Preferred: Copy Constructor
    public Point(Point other) {
        this.x = other.x;
        this.y = other.y;
    }
}`,
          interview: 'Q: Why are Copy Constructors generally preferred over implementing Cloneable and calling clone()?\nA: Cloneable is a flawed design requiring casting, throws CloneNotSupportedException, performs only shallow copying by default, and creates objects without invoking any constructor.'
        },
        {
          title: 'getClass() vs instanceof: Inheritance Equality Pitfall',
          desc: 'Symmetry violation in subclass equality checks and Joshua Bloch’s Effective Java rule.',
          content: 'Using `instanceof` in `equals()` allows a subclass instance to be equal to a parent class instance, which breaks the Symmetry rule if the subclass adds new fields. Comparing `getClass() != o.getClass()` strictly guarantees symmetry across subclass hierarchies.',
          code: `public class EqualityPitfall {
    public boolean strictEquals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false; // Strict class check
        return true;
    }
}`,
          interview: 'Q: What is the risk of using instanceof inside an equals() method when subclasses add state?\nA: It violates the Symmetry principle of the equals contract: parent.equals(child) may return true while child.equals(parent) returns false.'
        }
      ]
    },
    13: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'SOLID Design Principles & Modern Java Class Features (Records & Sealed Classes)',
      tasks: [
        {
          title: 'SOLID Principles 1 & 2: Single Responsibility & Open/Closed',
          desc: 'SRP (one reason to change) and OCP (open for extension, closed for modification via abstractions).',
          content: 'Single Responsibility Principle (SRP) states a class should have only one reason to change (e.g., separating business logic from database persistence). Open/Closed Principle (OCP) states software entities should be open for extension but closed for modification, achieved through interfaces and abstract strategies.',
          code: `// OCP via Strategy Interface
public interface NotificationSender {
    void send(String message, String recipient);
}

public class EmailSender implements NotificationSender {
    public void send(String msg, String to) { /* Send Email */ }
}
public class SmsSender implements NotificationSender {
    public void send(String msg, String to) { /* Send SMS */ }
}`,
          interview: 'Q: How do you achieve the Open/Closed Principle (OCP) in Java?\nA: By depending on interfaces or abstract classes. New functionality is added by creating new implementing classes without modifying tested existing code.'
        },
        {
          title: 'SOLID Principles 3, 4 & 5: Liskov Substitution, Interface Segregation & Dependency Inversion',
          desc: 'LSP (subtypes must be substitutable), ISP (fine-grained interfaces), and DIP (depend on abstractions).',
          content: 'LSP ensures derived classes do not break parent invariants (e.g., Square extending Rectangle violates width/height independence). ISP ensures clients are not forced to depend on methods they do not use. DIP mandates high-level modules should depend on abstractions, not concrete implementations.',
          code: `// DIP: High-level depends on abstraction
public class OrderService {
    private final PaymentGateway gateway; // Abstraction
    public OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}`,
          interview: 'Q: What is the Liskov Substitution Principle (LSP)?\nA: Subclasses must be completely substitutable for their base types without altering the correctness or intended behavior of the program.'
        },
        {
          title: 'Java Records (Java 16+): Immutable Data Carriers',
          desc: 'Boilerplate-free immutable classes, compact constructors, and automatic equals/hashCode/toString.',
          content: 'A `record` in Java 16+ is a transparent, immutable data carrier. The compiler automatically generates: private final fields, canonical constructor, public accessors (e.g. `name()`), `equals()`, `hashCode()`, and `toString()`. Records cannot extend other classes but can implement interfaces.',
          code: `public record OrderRecord(Long id, String customerEmail, double totalAmount) {
    // Compact constructor with validation
    public OrderRecord {
        if (totalAmount < 0) throw new IllegalArgumentException("Total amount cannot be negative");
        customerEmail = customerEmail.toLowerCase().trim();
    }
}`,
          interview: 'Q: What does the Java compiler automatically generate for a record declaration?\nA: Private final fields, a canonical constructor, public accessor methods matching component names, equals(), hashCode(), and toString().'
        },
        {
          title: 'Sealed Classes & Interfaces (Java 17+)',
          desc: 'Restricting inheritance hierarchies with `sealed`, `permits`, `final`, `non-sealed`.',
          content: 'Sealed classes (`sealed class ... permits A, B`) allow developers to explicitly define which subclasses are permitted to extend them. Permitted subclasses must be `final`, `sealed`, or `non-sealed`. This enables compiler-enforced exhaustive pattern matching in switch statements without default branches.',
          code: `public sealed interface PaymentResult permits Success, Failure, Pending {}

public final record Success(String txId) implements PaymentResult {}
public final record Failure(String errorCode, String message) implements PaymentResult {}
public final record Pending(long estimatedWaitMs) implements PaymentResult {}

// Exhaustive pattern matching
public String handle(PaymentResult res) {
    return switch (res) {
        case Success s -> "Paid: " + s.txId();
        case Failure f -> "Error: " + f.message();
        case Pending p -> "Waiting: " + p.estimatedWaitMs();
    }; // No default branch needed!
}`,
          interview: 'Q: What problem do Sealed Classes solve in Java?\nA: They restrict class hierarchies to a known, closed set of subclasses, enabling domain boundary safety and exhaustive pattern matching in switch expressions.'
        },
        {
          title: 'Pattern Matching for switch & instanceof (Java 17/21)',
          desc: 'Type pattern matching, record deconstruction patterns, and eliminating explicit casting.',
          content: 'Pattern matching eliminates error-prone boilerplate type casting. With pattern matching for `instanceof` (`if (obj instanceof String s)`), the variable `s` is automatically cast and in-scope. In switch statements, type patterns match specific classes and records with optional guard conditions (`when`).',
          code: `public class PatternMatchDemo {
    public static void process(Object obj) {
        if (obj instanceof String s && s.length() > 5) {
            System.out.println("Long string uppercase: " + s.toUpperCase());
        }
    }
}`,
          interview: 'Q: How does Pattern Matching for instanceof improve code safety and clarity?\nA: It combines the type check and casting into a single atomic operation, eliminating manual casting boilerplate and preventing ClassCastExceptions.'
        }
      ]
    },
    14: {
      week: 2, track: 'java', topic: 'Java OOP', title: 'Java Exception Handling Masterclass & Week 2 OOP Milestone Checkpoint',
      tasks: [
        {
          title: 'Exception Hierarchy: Throwable, Error, Exception & RuntimeException',
          desc: 'Checked vs Unchecked exceptions, JVM fatal errors, and recovery philosophy.',
          content: 'The exception hierarchy stems from `java.lang.Throwable`. Divided into: 1) `Error` (fatal JVM conditions like OutOfMemoryError; should not be caught), 2) `Exception` (checked exceptions requiring explicit throws/catch; e.g. IOException, SQLException), and 3) `RuntimeException` (unchecked programming bugs; e.g. NullPointerException, IllegalArgumentException).',
          code: `public class ExceptionHierarchyDemo {
    // Checked Exception: must be declared or caught
    public void readFile(String path) throws java.io.IOException {
        throw new java.io.IOException("File not found: " + path);
    }

    // Unchecked Exception: programming fault
    public void validateAge(int age) {
        if (age < 0) throw new IllegalArgumentException("Age cannot be negative");
    }
}`,
          interview: 'Q: What is the core difference between Checked and Unchecked exceptions in Java?\nA: Checked exceptions (subclasses of Exception excluding RuntimeException) are checked at compile-time and must be caught or declared in throws. Unchecked exceptions (subclasses of RuntimeException and Error) indicate programming errors and are not checked by the compiler.'
        },
        {
          title: 'try-catch-finally Execution Flow & Multi-Catch Blocks',
          desc: 'Order of execution, catching multiple exceptions `catch (A | B e)`, and finally block guarantees.',
          content: 'The `try` block wraps potentially failing code. `catch` blocks handle specific exception types (must be ordered from most specific subclass to most general superclass). The `finally` block ALWAYS executes regardless of whether an exception was thrown, caught, or a `return` was executed in try/catch.',
          code: `public class MultiCatchDemo {
    public static int parseAndDivide(String a, String b) {
        try {
            int num = Integer.parseInt(a);
            int den = Integer.parseInt(b);
            return num / den;
        } catch (NumberFormatException | ArithmeticException e) {
            System.err.println("Calculation failed: " + e.getMessage());
            return -1;
        } finally {
            System.out.println("Execution cleanup completed.");
        }
    }
}`,
          interview: 'Q: Does a finally block execute if there is a return statement inside the try block?\nA: Yes. The finally block is guaranteed to execute immediately before the method actually returns control to the caller (except in JVM crashes or System.exit()).'
        },
        {
          title: 'try-with-resources & AutoCloseable Interface',
          desc: 'Automatic resource management, suppressed exceptions, and eliminating resource leaks.',
          content: 'Java 7 introduced `try-with-resources`. Any class implementing `java.lang.AutoCloseable` or `java.io.Closeable` opened in the `try (...)` header is guaranteed to be closed automatically in reverse order of declaration. Handles suppressed exceptions (`e.getSuppressed()`) if both try body and close() throw exceptions.',
          code: `import java.io.*;

public class TryWithResourcesDemo {
    public static void copyFile(String src, String dest) throws IOException {
        try (InputStream in = new FileInputStream(src);
             OutputStream out = new FileOutputStream(dest)) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n);
            }
        } // Both streams closed automatically here
    }
}`,
          interview: 'Q: How does try-with-resources handle exceptions that occur during close() when the try block also threw an exception?\nA: The try block exception is thrown as the primary exception, and the close() exception is attached as a suppressed exception accessible via e.getSuppressed().'
        },
        {
          title: 'Designing Custom Business Exceptions & Exception Wrapping',
          desc: 'Creating domain exceptions, chaining root cause exceptions via initCause / constructor.',
          content: 'Custom domain exceptions convey specific business error conditions (e.g. `InsufficientFundsException`). When catching low-level technical exceptions (e.g., SQLException), wrap them into higher-level business exceptions with root causes chained (`new ServiceException("Payment failed", rootCause)`).',
          code: `public class InsufficientFundsException extends Exception {
    private final double deficit;

    public InsufficientFundsException(String message, double deficit) {
        super(message);
        this.deficit = deficit;
    }
    public double getDeficit() { return deficit; }
}`,
          interview: 'Q: Why is exception chaining important when rethrowing exceptions across architectural layers?\nA: It preserves the original root cause stack trace while allowing higher layers to handle clean, meaningful domain-specific exceptions.'
        },
        {
          title: 'Week 2 Capstone: Building a Production-Grade Banking Core in Java',
          desc: 'Synthesizing all 4 OOP pillars, records, sealed transactions, and custom exceptions into an enterprise module.',
          content: 'Complete integration milestone: Build an object-oriented banking engine utilizing encapsulation, polymorphism, inheritance, sealed transaction receipts, immutable balance records, and robust exception handling with automated JUnit tests.',
          code: `public class BankCoreApplication {
    public static void main(String[] args) {
        System.out.println("=== Java OOP Master Engine Initialized ===");
        System.out.println("Status: 4 OOP Pillars, SOLID Principles & Exception Safety fully verified.");
    }
}`,
          interview: 'Q: What are the fundamental architectural benefits of combining sealed classes, records, and domain exceptions in modern Java?\nA: It provides compile-time type safety, zero boilerplate, complete immutability guarantees, and explicit error domains that prevent unhandled edge cases.'
        }
      ]
    }
  };

  // 3. Generate all 200 Days with authentic topics across tracks
  // Distribution across 30 weeks:
  // - Weeks 1 to 20: 7 days each = 140 days (Weeks 1-6 Java [42d], Weeks 7-14 DSA [56d], Weeks 15-20 DBMS [42d])
  // - Weeks 21 to 30: 6 days each = 60 days (Weeks 21-22 DBMS [12d], Weeks 23-27 Fullstack [30d], Weeks 28-29 AI [12d], Week 30 Capstone [6d])
  // Total = 42 (Java) + 56 (DSA) + 54 (DBMS) + 30 (FullStack) + 12 (AI) + 6 (Capstone) = 200 Days!
  for (let d = 1; d <= 200; d++) {
    if (curriculumMap[d]) {
      const dayData = curriculumMap[d];
      days.push(
        buildDay(
          d,
          dayData.week,
          dayData.track,
          dayData.topic,
          dayData.title,
          `In-depth study and practical mastery of ${dayData.title} including theoretical foundations, edge cases, and code implementations.`,
          dayData.tasks,
          `Complete practical exercises and implementations for ${dayData.title}. Verify with test inputs.`,
          ['Read and comprehend all subtopic contents', 'Execute and trace code examples', 'Complete practical implementation', 'Review interview questions and common pitfalls']
        )
      );
    } else {
      let weekNum = 1;
      if (d <= 140) {
        weekNum = Math.floor((d - 1) / 7) + 1;
      } else {
        weekNum = Math.min(30, 21 + Math.floor((d - 141) / 6));
      }

      const weekDef = weekDefinitions.find((w) => w.num === weekNum) || weekDefinitions[0];
      const trackId = weekDef.track;

      let topicName = weekDef.title.split(':')[0].trim();
      let dayTitle = `${weekDef.title} — Module Day ${d}: Deep Dive & Engineering`;

      // Specific week titles & topics
      if (weekNum === 3) {
        topicName = 'Java Advanced OOP';
        dayTitle = `Java Advanced OOP: Generics, Reflection & Modern Language Features — Day ${d}`;
      } else if (weekNum === 4) {
        topicName = 'Java Collections Framework';
        dayTitle = `Java Collections: Lists, Sets, Maps, Queues & Internals — Day ${d}`;
      } else if (weekNum === 5) {
        topicName = 'Java Concurrency & Multithreading';
        dayTitle = `Java Concurrency: Thread Pools, Locks, JMM & Virtual Threads — Day ${d}`;
      } else if (weekNum === 6) {
        topicName = 'Modern Java & Spring Boot 3';
        dayTitle = `Enterprise Java: Streams API, Lambdas, Spring Boot 3 & JPA — Day ${d}`;
      } else if (weekNum === 7) {
        topicName = 'DSA: Arrays & Two Pointers';
        dayTitle = `Array Algorithms, Two Pointers & Prefix Sums — Day ${d}`;
      } else if (weekNum === 8) {
        topicName = 'DSA: Strings & Sliding Window';
        dayTitle = `String Algorithms, Sliding Window & Pattern Matching — Day ${d}`;
      } else if (weekNum === 9) {
        topicName = 'DSA: Linked Lists';
        dayTitle = `Linked List Engineering & Fast-Slow Pointer Techniques — Day ${d}`;
      } else if (weekNum === 10) {
        topicName = 'DSA: Trees & Tries';
        dayTitle = `Binary Trees, BSTs & Trie Prefix Structures — Day ${d}`;
      } else if (weekNum === 11) {
        topicName = 'DSA: Stacks & Queues';
        dayTitle = `Monotonic Stacks, Deques & Expression Parsing — Day ${d}`;
      } else if (weekNum === 12) {
        topicName = 'DSA: Graphs';
        dayTitle = `Graph Algorithms, BFS/DFS, TopoSort & Shortest Paths — Day ${d}`;
      } else if (weekNum === 13) {
        topicName = 'DSA: Dynamic Programming';
        dayTitle = `Dynamic Programming: 1D, 2D Grids & Knapsack Patterns — Day ${d}`;
      } else if (weekNum === 14) {
        topicName = 'DSA: Heaps, Searching & Sorting';
        dayTitle = `Heaps, Binary Search on Answers & Sorting Algorithms — Day ${d}`;
      } else if (weekNum >= 15 && weekNum <= 22) {
        // DBMS weeks from source
        const dbmsWeekTopics = [
          'Relational Model, Levels of Abstraction & Relational Algebra (Week 1 Source)',
          'SQL DDL, DML, Joins, Aggregates & Nested Subqueries (Week 2 Source)',
          'Advanced SQL, JDBC/ODBC, Stored Procedures & ER Modeling (Week 3 Source)',
          'Normalization, Functional Dependencies, 1NF-4NF & BCNF (Week 4 Source)',
          'App Architecture, SQL Injection, Storage & Buffer Pool (Week 5 Source)',
          'Indexing, B+ Trees, Height Calculations & Dynamic Hashing (Week 6 Source)',
          'Transactions, ACID, Precedence Graphs & 2PL Concurrency (Week 7 Source)',
          'Database Recovery, WAL, ARIES & Query Cost Optimization (Week 8 Source)',
        ];
        topicName = 'Database Management Systems';
        const subWk = weekNum - 15;
        dayTitle = `DBMS: ${dbmsWeekTopics[subWk]} — Day ${d}`;
      } else if (weekNum >= 23 && weekNum <= 27) {
        topicName = 'Full Stack Development';
        dayTitle = `Full Stack Web Mastery: ${weekDef.title} — Day ${d}`;
      } else if (weekNum >= 28 && weekNum <= 29) {
        topicName = 'Artificial Intelligence';
        dayTitle = `Applied AI & Machine Learning: ${weekDef.title} — Day ${d}`;
      } else if (weekNum === 30) {
        topicName = 'System Design & Capstone';
        dayTitle = `System Design, Capstones & Production Engineering — Day ${d}`;
      }

      // High-fidelity domain-specific task generator for Java, DBMS, and Systems
      let generatedTasks: { title: string; desc: string; content: string; code?: string; interview?: string }[] = [];

      if (trackId === 'java') {
        generatedTasks = [
          {
            title: `${topicName}: Core Language Invariants & JVM Runtime Execution`,
            desc: `Internal mechanics, memory layout, stack frame creation, and bytecode instructions.`,
            content: `Deep dive into ${dayTitle}. The JVM manages type validation, verification via ClassLoader, constant pool resolution, and memory safety invariants. Execution is handled through the JIT hotspot engine converting intermediate bytecode into native CPU instructions.`,
            code: `// Production Java Implementation
public class ${topicName.replace(/[^a-zA-Z]/g, '')}Service {
    private final String moduleName = "${dayTitle}";

    public void executeModule() {
        System.out.println("Executing optimized pipeline for " + moduleName);
    }
}`,
            interview: `Q: What is the primary performance consideration when working with ${topicName} in high-throughput Java services?\nA: Minimizing GC pressure by reducing object allocations, avoiding unnecessary boxing/unboxing, and leveraging zero-copy NIO buffers or thread pools.`
          },
          {
            title: `${topicName}: Advanced Design Patterns & API Architectures`,
            desc: `Idiomatic encapsulation, generic abstractions, and clean interfaces.`,
            content: `Architectural design patterns applied to ${topicName}. Using composition over inheritance, immutability guarantees, records, and functional interfaces for clean, decoupled systems.`,
            code: `// Functional & Generic Abstraction
@FunctionalInterface
public interface ModuleProcessor<T, R> {
    R process(T input) throws Exception;
}`,
            interview: `Q: How does modern Java 17/21 improve maintainability for ${topicName}?\nA: Using records for data carriers, sealed classes for domain boundaries, and pattern matching switch expressions for type-safe dispatch.`
          },
          {
            title: `${topicName}: Concurrency, Synchronization & Memory Safety`,
            desc: `Thread safety, atomic operations, volatile semantics, and Virtual Thread execution.`,
            content: `Analysis of multi-threaded execution within ${topicName}. Ensuring thread safety via CAS atomic primitives, ReentrantLock, Concurrent collections, and virtual threads without thread starvation.`,
            code: `// Thread-Safe Concurrency Pattern
private final java.util.concurrent.locks.ReentrantLock lock = new java.util.concurrent.locks.ReentrantLock();
public void safeExecute() {
    lock.lock();
    try {
        // Critical section
    } finally {
        lock.unlock();
    }
}`,
            interview: `Q: How does the Java Memory Model guarantee visibility in this pattern?\nA: Through Happens-Before relationships established by lock acquisition and release, volatile barriers, or concurrent collections.`
          },
          {
            title: `${topicName}: Performance Tuning, Profiling & Boundary Handling`,
            desc: `Benchmarking with JMH, heap dump analysis, and edge case defenses.`,
            content: `Profiling memory footprint, identifying L1/L2 cache misses, avoiding memory leaks from static references or unclosed resources, and ensuring proper defensive copies.`,
            code: `// Try-with-resources auto-closure
try (var resource = acquireResource()) {
    resource.process();
}`,
            interview: `Q: What common runtime exception must be guarded against in this domain?\nA: NullPointerExceptions, OutOfMemoryError, and concurrent modification conflicts.`
          },
          {
            title: `${topicName}: High-Frequency Technical Interview & Production Scenarios`,
            desc: `Real-world architectural trade-offs, scalability bottlenecks, and FAANG interview questions.`,
            content: `Practical evaluation of how top engineering teams deploy and scale ${topicName} under microservice architectures and high QPS loads.`,
            code: `// Production monitoring metric
System.out.println("Operation metric recorded for ${topicName.toLowerCase()}");`,
            interview: `Q: What is the single most critical trade-off made in this architecture?\nA: Balancing memory overhead and latency guarantees against development complexity and developer velocity.`
          }
        ];
      } else if (trackId === 'dbms') {
        generatedTasks = [
          {
            title: `${topicName}: Relational Engine Architecture & Disk Layout`,
            desc: `Slotted page structures, 8KB buffer pools, and storage access methods.`,
            content: `Comprehensive analysis of ${dayTitle}. The storage engine organizes relations into 8KB slotted pages on persistent storage. The Buffer Pool manager caches pages in memory using clock-sweep or LRU-K eviction, guaranteeing fast sequential reads and minimized random I/O.`,
            code: `-- PostgreSQL Storage & Index Inspection
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM ${topicName.toLowerCase().replace(/[^a-z]/g, '_')} WHERE id = 1;`,
            interview: `Q: What is the role of the Buffer Pool in database performance?\nA: It caches disk pages in RAM to eliminate slow physical disk I/O for frequently accessed (hot) data blocks.`
          },
          {
            title: `${topicName}: SQL Execution, Index Traversal & Optimization`,
            desc: `B+ Tree searches, covering indexes, and query execution plans.`,
            content: `How the query optimizer navigates indexes for ${topicName}. Analyzing cost models (CPU cost + random page cost vs sequential page cost) and index selectivity to avoid costly sequential table scans.`,
            code: `-- Optimal B+ Tree Index Creation
CREATE INDEX idx_${topicName.toLowerCase().replace(/[^a-z]/g, '_')}_composite 
ON ${topicName.toLowerCase().replace(/[^a-z]/g, '_')}(status, created_at DESC);`,
            interview: `Q: Why is a covering index with INCLUDE clause faster than a regular index?\nA: It allows Index-Only Scans by storing non-search payload columns in index leaf pages, avoiding secondary heap table fetches.`
          },
          {
            title: `${topicName}: ACID Guarantees, Isolation Levels & MVCC`,
            desc: `Multi-version concurrency, write-ahead logging (WAL), and lock isolation.`,
            content: `Ensuring strict transactional consistency for ${topicName}. PostgreSQL utilizes MVCC with xmin/xmax tuple headers so readers never block writers and writers never block readers. Durability is maintained via sequential WAL flushes.`,
            code: `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- Atomic business mutation
UPDATE accounts SET balance = balance - 100 WHERE id = 10;
COMMIT;`,
            interview: `Q: What is Write-Ahead Logging (WAL) and why is it mandatory for ACID?\nA: Changes must be logged sequentially to non-volatile WAL files before dirty buffer pages are flushed to table files, enabling crash recovery via ARIES.`
          },
          {
            title: `${topicName}: Normalization, Integrity Constraints & Schema Design`,
            desc: `BCNF/3NF decomposition, foreign key cascades, and check constraints.`,
            content: `Designing robust relational schemas. Eliminating insertion, deletion, and update anomalies through functional dependency analysis, ensuring primary and referential integrity constraints.`,
            code: `CREATE TABLE ${topicName.toLowerCase().replace(/[^a-z]/g, '_')}_ledger (
    id BIGSERIAL PRIMARY KEY,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`,
            interview: `Q: What is the difference between 3NF and BCNF?\nA: In BCNF, every determinant (X in X -> Y) must be a superkey without exception. 3NF allows X to not be a superkey if Y is a prime attribute.`
          },
          {
            title: `${topicName}: Production Scaling, Sharding & High-Availability`,
            desc: `Read replicas, connection pooling with PgBouncer, and partition pruning.`,
            content: `Scaling database systems to handle millions of queries. Implementing declarative table partitioning by range or list, configuring read replicas via streaming replication, and optimizing connection pools with HikariCP.`,
            code: `-- Declarative Table Partitioning
CREATE TABLE events_partitioned (
    id BIGINT,
    created_at DATE NOT NULL
) PARTITION BY RANGE (created_at);`,
            interview: `Q: Why is connection pooling essential for PostgreSQL?\nA: PostgreSQL uses a process-per-connection model. Unpooled connections cause severe memory bloat and operating system context-switching penalties.`
          }
        ];
      } else {
        generatedTasks = [
          {
            title: `Core Architectural Principles of ${topicName}`,
            desc: `Foundational theory, operational mechanics, and asymptotic guarantees.`,
            content: `Comprehensive analysis of ${dayTitle}. Key architectural concepts, formal definitions, and mathematical/system invariants.`,
          },
          {
            title: `Algorithmic Design & Implementation Details`,
            desc: `Step-by-step implementation walkthrough with code structures and invariants.`,
            content: `Concrete implementation details for ${topicName}. Data structures, memory management, and execution flow.`,
          },
          {
            title: `Edge Cases, Boundary Analysis & Robustness`,
            desc: `Handling null values, empty sets, concurrency conflicts, and capacity limits.`,
            content: `Critical boundary testing, defensive programming patterns, and failure mode recovery mechanisms.`,
          },
          {
            title: `Performance Optimization & Trade-Offs`,
            desc: `Time-space trade-offs, disk I/O reduction, and cache locality considerations.`,
            content: `Asymptotic complexity analysis comparing optimal approaches against naive baselines.`,
          },
          {
            title: `Industry Use Cases & Interview Applications`,
            desc: `Real-world production scenarios and high-frequency technical interview questions.`,
            content: `How top tech companies apply these principles in high-scale distributed systems and interview evaluations.`,
          },
        ];
      }

      days.push(
        buildDay(
          d,
          weekNum,
          trackId,
          topicName,
          dayTitle,
          `Mastery module for ${dayTitle}. Covers end-to-end design, implementation, and verification.`,
          generatedTasks,
          `Write, run, and benchmark practical code examples demonstrating the core concepts of ${dayTitle}.`,
          ['Understand theoretical foundations', 'Implement code solution from scratch', 'Validate edge cases with unit tests', 'Review interview questions and key trade-offs']
        )
      );
    }
  }

  const projects: ProjectSeed[] = [
    {
      title: 'Project 1: High-Performance Java In-Memory Database & CLI',
      description: 'Build a concurrent in-memory key-value and relational table engine in Java with custom B+ Tree indexing and SQL parser.',
      phase: 'Phase 1-3 (Java & DSA)',
      track_id: 'java',
      tech_stack: 'Java 21, Concurrency, Custom Data Structures, JUnit 5',
      requirements: 'Thread-safe table operations, B+ tree index range queries, transaction commit/rollback simulation, CLI interface.',
    },
    {
      title: 'Project 2: Enterprise Relational Database Manager with PostgreSQL',
      description: 'Design and deploy a normalized PostgreSQL enterprise schema with complex stored procedures, triggers, audit logging, and connection pooling.',
      phase: 'Phase 3 (DBMS & SQL)',
      track_id: 'dbms',
      tech_stack: 'PostgreSQL, JDBC, PL/pgSQL, Docker',
      requirements: 'BCNF normalized schema, audit triggers, foreign key cascading integrity, complex analytical reporting queries with CTEs.',
    },
    {
      title: 'Project 3: Modern React 19 Developer Dashboard & Workflow Studio',
      description: 'Build a high-density, responsive developer dashboard using React 19, TypeScript, Tailwind CSS, and custom hooks with offline caching.',
      phase: 'Phase 4 (Frontend)',
      track_id: 'fullstack',
      tech_stack: 'React 19, TypeScript, Tailwind CSS, React Router, Vite',
      requirements: 'Dark mode UI, live charts, optimistic UI updates, drag-and-drop workflow builder, zero layout shift.',
    },
    {
      title: 'Project 4: Production Full-Stack Spring Boot & React Platform',
      description: 'End-to-end multi-tier web application featuring Spring Boot 3, Spring Security with JWT, PostgreSQL, and React frontend.',
      phase: 'Phase 5-6 (Full Stack)',
      track_id: 'fullstack',
      tech_stack: 'Spring Boot 3, Spring Security, JWT, Hibernate/JPA, PostgreSQL, React, Docker',
      requirements: 'Role-based access control, RESTful APIs, paginated searching/filtering, automated integration tests, Docker deployment.',
    },
    {
      title: 'Project 5: Enterprise AI-Powered RAG & Agentic Assistant',
      description: 'Full-stack AI platform integrating vector databases, embeddings, hybrid retrieval-augmented generation, tool calling, and autonomous agents.',
      phase: 'Phase 7-8 (AI & LLMs)',
      track_id: 'ai',
      tech_stack: 'Python / Node.js, LangChain, OpenAI / Gemini API, pgvector, React, Tailwind',
      requirements: 'Document chunking & vector indexing, semantic search, hybrid keyword-vector retrieval, multi-turn AI chat with tool calling.',
    },
    {
      title: 'Final Capstone: Distributed Microservices & AI Workflow Engine',
      description: 'A production-grade, distributed engineering platform combining microservices, message queues, PostgreSQL, caching, and AI copilot.',
      phase: 'Phase 9-10 (Capstone & Interview)',
      track_id: 'capstone',
      tech_stack: 'Spring Boot, Node.js, React, PostgreSQL, Redis, Docker, GitHub Actions, Vercel & Render',
      requirements: 'Distributed architecture, caching layer, asynchronous event queue, rate limiting, production CI/CD pipeline, and full test suite.',
    },
  ];

  return { tracks, weeks, days, leetcodeProblems, projects };
}
