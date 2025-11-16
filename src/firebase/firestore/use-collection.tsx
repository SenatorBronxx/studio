// src/firebase/firestore/use-collection.tsx
'use client';

import {
  DocumentData,
  FirestoreError,
  Query,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) return;

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data());
        setData(data);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: query.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
