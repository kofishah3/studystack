export type ParsedQuestion = {
  auxiliaryModal: string | null;  // How, Why, What, When, Where, Can, Could, etc.
  subject: string | null;         // The main topic (less important)
  mainVerb: string | null;        // The action word
  x: string | null;               // The object/noun at the end
};

const AUX_MODAL_WORDS = [
  'how', 'why', 'what', 'when', 'where', 'which',
  'can', 'could', 'would', 'will', 'should', 'might', 'may',
  'is', 'are', 'was', 'were', 'do', 'does', 'did', 'have', 'has'
];

const STOP_WORDS = ['the', 'a', 'an', 'to', 'for', 'of', 'with', 'without', 'and', 'or'];

export function parseQuestion(content: string): ParsedQuestion {
  const words = content.toLowerCase().replace(/[?]/g, '').split(/\s+/);
  
  const auxiliaryModal = AUX_MODAL_WORDS.includes(words[0]) ? words[0] : null;
  
  let mainVerb = null;
  let verbIndex = -1;
  const verbIndicators = ['test', 'run', 'make', 'do', 'create', 'build', 'use', 'learn', 'study', 'solve'];
  
  for (let i = 0; i < words.length; i++) {
    if (verbIndicators.includes(words[i])) {
      mainVerb = words[i];
      verbIndex = i;
      break;
    }
  }

  let x = null;
  if (verbIndex !== -1 && verbIndex + 1 < words.length) {
    x = words.slice(verbIndex + 1).filter(w => !STOP_WORDS.includes(w)).join(' ');
  } else if (words.length > 1) {
    x = words.slice(-3).filter(w => !STOP_WORDS.includes(w)).join(' ');
  }
  
  return {
    auxiliaryModal,
    subject: null, 
    mainVerb,
    x
  };
}

export function calculateSimilarityScore(parsed1: ParsedQuestion, parsed2: ParsedQuestion): number {
  let score = 0;
  
  // 1. Auxiliary/Modal match (most important) - 10 points
  if (parsed1.auxiliaryModal && parsed2.auxiliaryModal && 
      parsed1.auxiliaryModal === parsed2.auxiliaryModal) {
    score += 10;
  }
  
  // 2. Main verb + X match - 4 points
  if (parsed1.mainVerb && parsed2.mainVerb && 
      parsed1.mainVerb === parsed2.mainVerb &&
      parsed1.x && parsed2.x && 
      wordsSimilarity(parsed1.x, parsed2.x) > 0.6) {
    score += 4;
  }
  
  // 3. X similarity (topic match) - 2 points
  if (parsed1.x && parsed2.x) {
    const similarity = wordsSimilarity(parsed1.x, parsed2.x);
    if (similarity > 0.5) {
      score += 2;
    }
  }
  
  return score;
}

// Helper function to calculate similarity between two strings
function wordsSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w)).length;
  const totalUnique = new Set([...words1, ...words2]).size;
  return commonWords / totalUnique;
}