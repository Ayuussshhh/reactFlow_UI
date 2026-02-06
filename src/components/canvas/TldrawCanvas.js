import { Tldraw, createShapeId, useEditor } from 'tldraw';
import 'tldraw/tldraw.css';
import { useEffect, useRef } from 'react';
import { TableShapeUtil } from './TableShapeUtil';
import { useAppStore } from '../../store';

const customShapeUtils = [TableShapeUtil];

function EditorEvents() {
    const editor = useEditor();
    const { setSelectedObject, setSidePanelOpen, tables, connection } = useAppStore();
    const previousTablesRef = useRef([]);
    const shapesCreatedRef = useRef(false);

    // Handle selection changes
    useEffect(() => {
        if (!editor) return;

        const handleSelectionChange = () => {
            const selectedIds = editor.getSelectedShapeIds();
            
            if (selectedIds.length === 1) {
                const shape = editor.getShape(selectedIds[0]);
                if (shape && shape.type === 'table') {
                    setSelectedObject({
                        id: shape.id,
                        type: 'table',
                        data: shape.props
                    });
                    setSidePanelOpen(true);
                }
            } else if (selectedIds.length === 0) {
                setSidePanelOpen(false);
                setSelectedObject(null);
            }
        };

        const cleanup = editor.store.listen(handleSelectionChange, { scope: 'document' });
        return () => cleanup();
    }, [editor, setSelectedObject, setSidePanelOpen]);
    
    // Sync tables from database to canvas
    useEffect(() => {
        if (!editor || !connection.isConnected) {
            // Clear canvas when disconnected
            if (editor && !connection.isConnected && shapesCreatedRef.current) {
                console.log('[Canvas] Clearing canvas - disconnected');
                const allShapes = editor.getCurrentPageShapes();
                if (allShapes.length > 0) {
                    editor.deleteShapes(allShapes.map(s => s.id));
                }
                shapesCreatedRef.current = false;
                previousTablesRef.current = [];
            }
            return;
        }
        
        console.log('[Canvas] Tables changed:', tables?.length || 0, 'tables');
        
        // Only update if tables actually changed
        const currentTableNames = (tables || []).map(t => t.name).sort().join(',');
        const previousTableNames = previousTablesRef.current.map(t => t.name).sort().join(',');
        
        if (currentTableNames === previousTableNames && shapesCreatedRef.current) {
            console.log('[Canvas] Tables unchanged, skipping update');
            return;
        }
        
        if (!Array.isArray(tables) || tables.length === 0) {
            console.log('[Canvas] No tables to display');
            return;
        }
        
        console.log('[Canvas] Creating shapes for', tables.length, 'tables');
        
        // Clear existing table shapes
        const existingShapes = editor.getCurrentPageShapes().filter(s => s.type === 'table');
        if (existingShapes.length > 0) {
            console.log('[Canvas] Removing', existingShapes.length, 'existing shapes');
            editor.deleteShapes(existingShapes.map(s => s.id));
        }
        
        // Color palette
        const colors = ['blue', 'violet', 'green', 'orange', 'red'];
        
        // Create shapes for each table
        const shapes = tables.map((table, index) => {
            const tableName = table.name;
            const columns = table.columns || [];
            
            // Convert backend column format to canvas field format
            const fields = columns.map(col => ({
                name: col.name,
                type: col.data_type || col.type || 'text',
                pk: col.is_primary_key || col.isPrimaryKey || false,
                nullable: col.nullable,
                fk: null, // Will be populated from foreign keys
            }));
            
            const baseHeight = 50; // Header height
            const fieldHeight = 32; // Height per field
            const totalHeight = baseHeight + (fields.length * fieldHeight) + 20;
            
            return {
                id: createShapeId(),
                type: 'table',
                x: 100 + (index % 4) * 320,
                y: 100 + Math.floor(index / 4) * 300,
                props: {
                    w: 280,
                    h: Math.max(totalHeight, 150),
                    tableName: tableName,
                    color: colors[index % colors.length],
                    fields: fields,
                }
            };
        });
        
        if (shapes.length > 0) {
            console.log('[Canvas] Creating', shapes.length, 'table shapes');
            editor.createShapes(shapes);
            shapesCreatedRef.current = true;
            previousTablesRef.current = tables;
        }
    }, [editor, tables, connection.isConnected]);

    return null;
}

export default function TldrawCanvas() {
    const { connection } = useAppStore();
    
    // Use database-specific persistence key
    const persistenceKey = connection.isConnected && connection.database 
        ? `schemaflow-${connection.database}` 
        : 'schemaflow-canvas';
    
    return (
        <div className="absolute inset-0">
            <Tldraw 
                shapeUtils={customShapeUtils}
                persistenceKey={persistenceKey}
            >
                <EditorEvents />
            </Tldraw>
        </div>
    );
}
