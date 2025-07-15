import { supabase } from '@/integrations/supabase/client';

export interface BatchContextOperation {
  type: 'mood' | 'clothing' | 'location' | 'time_weather' | 'relationship' | 'character_position';
  value: string;
  key: string;
}

export interface BatchOperationResult {
  success: boolean;
  operationsCount: number;
  executionTime: number;
  errors: string[];
}

export class DatabaseBatchOperations {
  private static instance: DatabaseBatchOperations;
  private operationQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  
  public static getInstance(): DatabaseBatchOperations {
    if (!DatabaseBatchOperations.instance) {
      DatabaseBatchOperations.instance = new DatabaseBatchOperations();
    }
    return DatabaseBatchOperations.instance;
  }

  // Batch context operations for better performance
  public async batchContextOperations(
    userId: string,
    characterId: string,
    chatId: string,
    contextMappings: BatchContextOperation[],
    addonSettings: Record<string, boolean>
  ): Promise<BatchOperationResult> {
    const startTime = Date.now();
    const operations: Array<() => Promise<any>> = [];
    const errors: string[] = [];

    // Create batch operations for context updates
    for (const mapping of contextMappings) {
      const isAddonEnabled = addonSettings[mapping.key];
      
      if (isAddonEnabled && mapping.value !== 'No context') {
        operations.push(async () => {
          try {
            await supabase
              .from('user_chat_context')
              .upsert({
                user_id: userId,
                character_id: characterId,
                chat_id: chatId,
                context_type: mapping.type,
                current_context: mapping.value
              });
          } catch (error) {
            errors.push(`Failed to update ${mapping.type}: ${error.message}`);
          }
        });
      }
    }

    // Execute all operations in parallel
    try {
      await Promise.all(operations.map(op => op()));
      
      return {
        success: errors.length === 0,
        operationsCount: operations.length,
        executionTime: Date.now() - startTime,
        errors
      };
    } catch (error) {
      errors.push(`Batch operation failed: ${error.message}`);
      return {
        success: false,
        operationsCount: operations.length,
        executionTime: Date.now() - startTime,
        errors
      };
    }
  }

  // Queue operation for deferred execution
  public queueOperation(operation: () => Promise<any>): void {
    this.operationQueue.push(operation);
    this.processQueue();
  }

  // Process queued operations
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.operationQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Process in batches of 10
    const batchSize = 10;
    while (this.operationQueue.length > 0) {
      const batch = this.operationQueue.splice(0, batchSize);
      
      try {
        await Promise.all(batch.map(op => op()));
      } catch (error) {
        console.error('Batch operation error:', error);
      }
    }
    
    this.isProcessing = false;
  }

  // Clear all queued operations
  public clearQueue(): void {
    this.operationQueue = [];
  }
}

export const dbBatchOps = DatabaseBatchOperations.getInstance();