import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Tag {
  id: number;
  name: string;
}

const TestTags = () => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      console.log('TestTags: Starting to fetch tags...');
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.from('tags').select('*').order('name');
        
        if (error) {
          console.error('TestTags: Error fetching tags:', error);
          setError(`Error: ${error.message}`);
          setAllTags([]);
        } else {
          console.log('TestTags: Fetched tags successfully:', data);
          setAllTags(data || []);
        }
      } catch (err) {
        console.error('TestTags: Catch error:', err);
        setError(`Catch error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagSelect = (tagId: string) => {
    setSelectedTag(tagId);
    const selectedTagObj = allTags.find(tag => tag.id.toString() === tagId);
    console.log('TestTags: Selected tag:', selectedTagObj);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Test Tags Page</h1>
        
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-white font-semibold mb-2">Status:</h2>
            <p className="text-gray-300">
              Loading: {isLoading ? 'Yes' : 'No'}
            </p>
            <p className="text-gray-300">
              Tags Count: {allTags.length}
            </p>
            {error && (
              <p className="text-red-400">
                Error: {error}
              </p>
            )}
          </div>

          {/* Raw Data Display */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-white font-semibold mb-2">Raw Tags Data:</h2>
            <pre className="text-gray-300 text-sm overflow-auto max-h-40">
              {JSON.stringify(allTags, null, 2)}
            </pre>
          </div>

          {/* Dropdown Test */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-white font-semibold mb-4">Dropdown Test:</h2>
            
            <Select onValueChange={handleTagSelect} disabled={isLoading}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue 
                  placeholder={
                    isLoading 
                      ? 'Loading tags...' 
                      : `Select a tag... (${allTags.length} available)`
                  } 
                />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {allTags.length > 0 ? (
                  allTags.map((tag) => (
                    <SelectItem 
                      key={tag.id} 
                      value={tag.id.toString()}
                      className="text-white hover:bg-gray-600 focus:bg-gray-600"
                    >
                      {tag.name} (ID: {tag.id})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-tags" disabled className="text-gray-400">
                    {error ? 'Error loading tags' : 'No tags found'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {selectedTag && (
              <div className="mt-4 p-3 bg-gray-600 rounded">
                <p className="text-white">
                  Selected Tag ID: {selectedTag}
                </p>
                <p className="text-white">
                  Selected Tag Name: {allTags.find(t => t.id.toString() === selectedTag)?.name}
                </p>
              </div>
            )}
          </div>

          {/* Simple List Display */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-white font-semibold mb-4">Simple List Display:</h2>
            {isLoading ? (
              <p className="text-gray-300">Loading...</p>
            ) : allTags.length > 0 ? (
              <ul className="space-y-1">
                {allTags.map((tag) => (
                  <li key={tag.id} className="text-gray-300">
                    {tag.id}: {tag.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No tags to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTags;