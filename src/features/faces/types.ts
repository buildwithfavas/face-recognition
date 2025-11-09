export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Gender = 'male' | 'female' | 'other';
export type FaceExpressions = Record<string, number>;

export interface FaceResult {
  id: string;
  box: FaceBox; // bounding box
  score?: number;
  age?: number;
  gender?: Gender;
  expressions?: FaceExpressions;
  name?: string;
  features?: number[]; // feature vector (embeddings)
  dob?: string; // date of birth from matched face
}

export interface Person {
  id: string;
  name: string;
  embeddings?: number[];
}
