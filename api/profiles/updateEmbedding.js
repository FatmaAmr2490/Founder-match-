import { createClient } from '@supabase/supabase-js'
import keywordExtractor  from 'keyword-extractor'
import supabase from '../lib/supabase.js'
import { InferenceClient } from '@huggingface/inference'
import {withAuth} from '@/lib/secure'


console.log('HF token:', typeof process.env.HUGGINGFACE_API_TOKEN, process.env.HUGGINGFACE_API_TOKEN)

// Initialize the Hugging Face inference client
 const hf = new InferenceClient(
   process.env.HUGGINGFACE_API_TOKEN
 )

async function handler(req, res) {
  // Only POST requests allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, idea_description  } = req.body

  // Validate input
  if (typeof user_id !== 'number' || typeof idea_description !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id/idea_description' })
  }

  try {
    // 1) Extract keyphrases from the 'idea_description' text
    //    - removes duplicates, numbers, lowercases everything
    const keyphrases = keywordExtractor.extract(idea_description, {
      language: 'english',
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    })

    // 2) Call Hugging Face Inference API to get a 768-dim embedding
    const hfResult = await hf.featureExtraction({
      model: 'sentence-transformers/all-mpnet-base-v2',
      inputs: idea_description
    })
    // featureExtraction returns an array of arrays; we take the first row
    const vector = Array.isArray(hfResult[0]) ? hfResult[0] : hfResult

    // 3) Update the Supabase user row with the new vector & keyphrases
    const { error } = await supabase
      .from('users')
      .update({
        idea_description,
        keyphrases,
        idea_embedding: vector
      })
      .eq('id', user_id)

    if (error) throw error

    // Success
    res.status(200).json({ status: 'ok' })
  } catch (e) {
    console.error('updateEmbedding error:', e)
    res.status(500).json({ error: e.message || 'Internal server error' })
  }
}

export default withAuth(handler)
