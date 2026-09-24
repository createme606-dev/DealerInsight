import { FeedbackRecord, Sentiment, Category, AnalysisSummary } from '../types';

const negativePatterns = [
  /not expecting|unexpected fee|hidden fee|extra charge/i,
  /waited|waiting|late|delay|took forever|hours?/i,
  /call(ed)? (two|three|four|multiple|several) times|nobody (responded|called|explained)/i,
  /not ready|still not ready|wasn't ready/i,
  /rude|dismissive|unhelpful|rushed me/i,
  /poor communication|no update|didn't explain/i,
  /overcharged|price changed|more expensive/i,
];

const positivePatterns = [
  /helpful|patient|friendly|professional|great job/i,
  /on time|earlier than expected|ready when promised|quick|efficient/i,
  /explained everything|kept me updated|clear communication/i,
  /easy process|smooth|excellent experience/i,
];

function detectSentiment(text: string): { sentiment: Sentiment; score: number } {
  let score = 0;

  for (const pattern of negativePatterns) {
    if (pattern.test(text)) score -= 25;
  }
  for (const pattern of positivePatterns) {
    if (pattern.test(text)) score += 25;
  }

  // Simple word-based adjustment
  const lower = text.toLowerCase();
  if (lower.includes('love') || lower.includes('excellent') || lower.includes('amazing')) score += 20;
  if (lower.includes('terrible') || lower.includes('awful') || lower.includes('worst')) score -= 30;

  score = Math.max(-100, Math.min(100, score));

  let sentiment: Sentiment = 'neutral';
  if (score >= 25) sentiment = 'positive';
  else if (score <= -20) sentiment = 'negative';

  return { sentiment, score };
}

function detectCategory(text: string): Category {
  const lower = text.toLowerCase();

  if (/price|fee|cost|charge|expensive|discount/.test(lower)) return 'Pricing';
  if (/financ|loan|credit|payment|interest/.test(lower)) return 'Financing';
  if (/wait|late|appointment|delay|hours?/.test(lower)) return 'Wait Times';
  if (/part|repair|fix|update on my (car|vehicle|repair)/.test(lower)) return 'Parts/Repairs';
  if (/sales(person|man|woman)?|buy|purchase|deal/.test(lower)) return 'Sales';
  if (/service|advisor|technician|oil change|maintenance/.test(lower)) return 'Service';
  if (/staff|employee|rude|friendly|helpful|professional/.test(lower)) return 'Staff';
  if (/problem|issue|broken|not working|defect/.test(lower)) return 'Vehicle Problems';

  return 'Other';
}

export function analyzeFeedback(rawText: string, date?: string, department?: string): FeedbackRecord {
  const { sentiment, score } = detectSentiment(rawText);
  const category = detectCategory(rawText);

  return {
    id: crypto.randomUUID(),
    date: date || new Date().toISOString().slice(0, 10),
    feedback: rawText.trim(),
    department,
    sentiment,
    category,
    score,
  };
}

export function summarize(records: FeedbackRecord[]): AnalysisSummary {
  const total = records.length;
  let positive = 0;
  let neutral = 0;
  let negative = 0;

  const categories: Record<Category, number> = {
    Sales: 0,
    Service: 0,
    Financing: 0,
    Pricing: 0,
    'Vehicle Problems': 0,
    'Wait Times': 0,
    Staff: 0,
    'Parts/Repairs': 0,
    Other: 0,
  };

  const problemCounts: Record<string, number> = {};

  for (const r of records) {
    if (r.sentiment === 'positive') positive++;
    else if (r.sentiment === 'neutral') neutral++;
    else negative++;

    categories[r.category] = (categories[r.category] || 0) + 1;

    if (r.sentiment === 'negative') {
      const key = r.category;
      problemCounts[key] = (problemCounts[key] || 0) + 1;
    }
  }

  const topProblems = Object.entries(problemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate simple recommendations
  const recommendations: string[] = [];
  if (problemCounts['Wait Times'] > 1) {
    recommendations.push('Review appointment scheduling and staffing levels in Service to reduce wait times.');
  }
  if (problemCounts['Pricing'] > 0) {
    recommendations.push('Improve transparency around fees and final pricing during the sales and finance process.');
  }
  if (problemCounts['Parts/Repairs'] > 1 || problemCounts['Service'] > 1) {
    recommendations.push('Implement a standard customer update process for any repair delayed more than 24 hours.');
  }
  if (problemCounts['Staff'] > 0) {
    recommendations.push('Provide additional training on customer communication and service standards.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring feedback. No major recurring issues detected in the current data.');
  }

  return {
    total,
    positive,
    neutral,
    negative,
    categories,
    topProblems,
    recommendations,
  };
}
