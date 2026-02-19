/**
 * SchemaFlow Store
 * Clean, typed state management with Zustand
 */
import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

// ==================== Auth Store ====================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: !!user,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'schemaflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ==================== Connection Store ====================
export const useConnectionStore = create(
  subscribeWithSelector((set, get) => ({
    activeConnection: null,
    connections: [],
    isConnecting: false,
    error: null,

    setConnection: (connection) => {
      set({ activeConnection: connection, error: null });
    },

    setConnections: (connections) => set({ connections }),

    addConnection: (connection) => {
      set((state) => ({
        connections: [...state.connections, connection],
      }));
    },

    removeConnection: (id) => {
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
        activeConnection:
          state.activeConnection?.id === id ? null : state.activeConnection,
      }));
    },

    setConnecting: (connecting) => set({ isConnecting: connecting }),
    setError: (error) => set({ error }),
    
    disconnect: () => {
      set({ activeConnection: null });
    },
  }))
);

// ==================== Schema Store ====================
export const useSchemaStore = create(
  subscribeWithSelector((set, get) => ({
    tables: [],
    foreignKeys: [],
    isLoading: false,
    devMode: false, // Toggle to show SQL types

    setSchema: (tables, foreignKeys) => {
      set({ tables, foreignKeys });
    },

    setTables: (tables) => set({ tables }),
    setForeignKeys: (foreignKeys) => set({ foreignKeys }),
    setLoading: (loading) => set({ isLoading: loading }),
    toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
    setDevMode: (devMode) => set({ devMode }),

    // Get table by name
    getTable: (name) => {
      return get().tables.find((t) => t.name === name);
    },

    // Clear all schema data
    clearSchema: () => {
      set({ tables: [], foreignKeys: [] });
    },
  }))
);

// ==================== Proposal Store ====================
export const useProposalStore = create(
  subscribeWithSelector((set, get) => ({
    proposals: [],
    activeProposal: null,
    draftChanges: [], // Changes being drafted before creating proposal
    isLoading: false,

    setProposals: (proposals) => set({ proposals }),

    setActiveProposal: (proposal) => set({ activeProposal: proposal }),

    addDraftChange: (change) => {
      set((state) => ({
        draftChanges: [...state.draftChanges, { ...change, id: Date.now() }],
      }));
    },

    removeDraftChange: (id) => {
      set((state) => ({
        draftChanges: state.draftChanges.filter((c) => c.id !== id),
      }));
    },

    clearDraftChanges: () => set({ draftChanges: [] }),

    setLoading: (loading) => set({ isLoading: loading }),

    // Get changes affecting a specific table
    getTableChanges: (tableName) => {
      const { activeProposal, draftChanges } = get();
      const proposalChanges = activeProposal?.changes || [];
      return [...proposalChanges, ...draftChanges].filter(
        (c) => c.tableName === tableName || c.table === tableName
      );
    },
  }))
);

// ==================== Canvas Store ====================
export const useCanvasStore = create(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    viewport: { x: 0, y: 0, zoom: 1 },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    updateNode: (id, data) => {
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n
        ),
      }));
    },

    setSelectedNode: (node) => set({ selectedNode: node, selectedEdge: null }),
    setSelectedEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),
    clearSelection: () => set({ selectedNode: null, selectedEdge: null }),

    setViewport: (viewport) => set({ viewport }),

    // Convert schema to React Flow nodes and edges with intelligent layout
    buildFromSchema: (tables, foreignKeys) => {
      // Layout configuration
      const NODE_WIDTH = 280;
      const NODE_HEIGHT = 250;
      const GAP_X = 120;
      const GAP_Y = 100;
      const PADDING = 60;
      
      // Calculate optimal grid dimensions based on table count
      const tableCount = tables.length;
      const cols = Math.ceil(Math.sqrt(tableCount * 1.5)); // Slightly wider than square
      
      // Build relationship map for smarter positioning
      const relationshipMap = new Map();
      foreignKeys.forEach(fk => {
        const source = fk.sourceTable || fk.fromTable;
        const target = fk.targetTable || fk.toTable;
        if (!relationshipMap.has(source)) relationshipMap.set(source, new Set());
        if (!relationshipMap.has(target)) relationshipMap.set(target, new Set());
        relationshipMap.get(source).add(target);
        relationshipMap.get(target).add(source);
      });
      
      // Sort tables to place related tables near each other
      const sortedTables = [...tables].sort((a, b) => {
        const aRels = relationshipMap.get(a.name)?.size || 0;
        const bRels = relationshipMap.get(b.name)?.size || 0;
        return bRels - aRels; // Most connected tables first
      });

      const nodes = sortedTables.map((table, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Add slight variation to avoid perfectly aligned grid
        const offsetX = (row % 2) * (GAP_X * 0.2);
        const offsetY = (col % 2) * (GAP_Y * 0.1);

        return {
          id: table.name,
          type: 'tableNode',
          position: {
            x: PADDING + col * (NODE_WIDTH + GAP_X) + offsetX,
            y: PADDING + row * (NODE_HEIGHT + GAP_Y) + offsetY,
          },
          data: {
            table,
            isProposed: false,
            proposalType: null,
          },
        };
      });

      const edges = foreignKeys.map((fk, index) => ({
        id: `fk-${fk.constraintName || index}`,
        source: fk.sourceTable || fk.fromTable,
        target: fk.targetTable || fk.toTable,
        sourceHandle: fk.sourceColumn || fk.fromColumn,
        targetHandle: fk.targetColumn || fk.toColumn,
        type: 'relationEdge',
        data: {
          constraintName: fk.constraintName,
          onDelete: fk.onDelete,
          onUpdate: fk.onUpdate,
        },
        animated: false,
      }));

      set({ nodes, edges });
    },
  }))
);

// ==================== UI Store ====================
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  proposalPanelOpen: false,
  commandPaletteOpen: false,
  connectDialogOpen: false,
  impactPanelOpen: false,
  theme: 'light',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleProposalPanel: () =>
    set((state) => ({ proposalPanelOpen: !state.proposalPanelOpen })),
  setProposalPanelOpen: (open) => set({ proposalPanelOpen: open }),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setConnectDialogOpen: (open) => set({ connectDialogOpen: open }),
  setImpactPanelOpen: (open) => set({ impactPanelOpen: open }),

  setTheme: (theme) => set({ theme }),
}));

// ==================== Impact Analysis Store ====================
export const useImpactStore = create(
  subscribeWithSelector((set, get) => ({
    // Snapshots
    snapshots: [],
    latestSnapshot: null,
    baselineSnapshot: null,
    isLoadingSnapshots: false,

    // Diff results
    currentDiff: null,
    rulesResult: null,

    // Blast radius
    selectedObject: null, // { schema, table, column? }
    blastRadius: null,
    highlightedNodes: [], // Node IDs to highlight on canvas
    highlightedEdges: [], // Edge IDs to highlight on canvas

    // Actions
    setSnapshots: (snapshots) => set({ snapshots }),
    setLatestSnapshot: (snapshot) => set({ latestSnapshot: snapshot }),
    setBaselineSnapshot: (snapshot) => set({ baselineSnapshot: snapshot }),
    setLoadingSnapshots: (loading) => set({ isLoadingSnapshots: loading }),

    setDiff: (diff, rulesResult) => set({ currentDiff: diff, rulesResult }),
    clearDiff: () => set({ currentDiff: null, rulesResult: null }),

    setSelectedObject: (obj) => set({ selectedObject: obj }),
    setBlastRadius: (blastRadius) => {
      // Extract impacted table names for highlighting
      const highlightedNodes = blastRadius?.impacted
        ?.filter((i) => i.objectType === 'table')
        ?.map((i) => i.path.split('.').pop()) || [];
      
      set({ blastRadius, highlightedNodes });
    },
    clearBlastRadius: () => set({ 
      blastRadius: null, 
      highlightedNodes: [], 
      highlightedEdges: [],
      selectedObject: null 
    }),

    // Highlight specific nodes (for blast radius visualization)
    setHighlightedNodes: (nodeIds) => set({ highlightedNodes: nodeIds }),
    setHighlightedEdges: (edgeIds) => set({ highlightedEdges: edgeIds }),
  }))
);
