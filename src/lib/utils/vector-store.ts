
import { cosineSimilarity } from './similarity';
import documents from '@/app/data/documents.json';

export interface Document {
    id: string;
    text: string;
    embedding: number[];
  }
  
export class VectorStore {
  private documents: Document[];

  constructor() {
    this.documents = documents as Document[];
  }

  async findSimilarDocuments(queryEmbedding: number[], limit: number = 3): Promise<Document[]> {
    const documentsWithScores = this.documents.map(doc => ({
      ...doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    return documentsWithScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}