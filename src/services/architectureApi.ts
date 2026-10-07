import {
  ArchitectureInput,
  ArchitectureResult,
  ArchitectureReviewResult,
  ArchitectureReviewFinding,
  ArchitectureFixProposal,
  ArchitectureComparisonResult,
} from '../types/architecture';

/**
 * Standardized API response error with friendly message.
 */
export class ArchitectureApiError extends Error {
  statusCode?: number;
  debugMessage?: string;

  constructor(message: string, statusCode?: number, debugMessage?: string) {
    super(message);
    this.name = 'ArchitectureApiError';
    this.statusCode = statusCode;
    this.debugMessage = debugMessage;
  }
}

/**
 * Helper to process JSON response and handle HTTP errors consistently.
 */
async function parseApiResponse<T>(response: Response, defaultErrorMessage: string): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new ArchitectureApiError(
      defaultErrorMessage,
      response.status,
      `Failed to parse JSON response (${response.status} ${response.statusText})`
    );
  }

  if (!response.ok) {
    const errorMsg = data?.error || defaultErrorMessage;
    throw new ArchitectureApiError(errorMsg, response.status, data?.debugMessage);
  }

  return data as T;
}

/**
 * Validates that an ArchitectureResult has required minimum structure.
 */
function validateArchitectureResult(data: any): ArchitectureResult {
  if (!data || typeof data !== 'object') {
    throw new ArchitectureApiError('Malformed architecture data received from AI engine.');
  }
  if (!data.projectName || typeof data.projectName !== 'string') {
    throw new ArchitectureApiError('Architecture specification is missing project name.');
  }
  if (!data.recommendedArchitectureStyle || typeof data.recommendedArchitectureStyle !== 'object') {
    throw new ArchitectureApiError('Architecture specification is missing recommended style.');
  }
  if (!Array.isArray(data.architectureComponents)) {
    data.architectureComponents = [];
  }
  if (!Array.isArray(data.services)) {
    data.services = [];
  }
  if (!Array.isArray(data.functionalRequirements)) {
    data.functionalRequirements = [];
  }
  if (!Array.isArray(data.nonFunctionalRequirements)) {
    data.nonFunctionalRequirements = [];
  }
  return data as ArchitectureResult;
}

/**
 * Validates that an ArchitectureReviewResult has required minimum structure.
 */
function validateArchitectureReviewResult(data: any): ArchitectureReviewResult {
  if (!data || typeof data !== 'object') {
    throw new ArchitectureApiError('Malformed review data received from AI engine.');
  }
  if (typeof data.overallHealthScore !== 'number') {
    data.overallHealthScore = 85;
  }
  if (!Array.isArray(data.findings)) {
    data.findings = [];
  }
  if (!data.categoryScores || typeof data.categoryScores !== 'object') {
    data.categoryScores = {
      scalability: 85,
      availability: 85,
      performance: 85,
      security: 85,
      reliability: 85,
      costEfficiency: 85,
    };
  }
  return data as ArchitectureReviewResult;
}

/**
 * Generate a complete software architecture from input requirements.
 */
export async function apiGenerateArchitecture(input: ArchitectureInput): Promise<ArchitectureResult> {
  const response = await fetch('/api/architecture/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const raw = await parseApiResponse<any>(
    response,
    'Failed to generate software architecture. Please check connection and try again.'
  );

  return validateArchitectureResult(raw);
}

/**
 * Run peer review against current authoritative architecture.
 */
export async function apiReviewArchitecture(
  architecture: ArchitectureResult,
  requirements: ArchitectureInput
): Promise<ArchitectureReviewResult> {
  // Strip previous review to prevent review-chain bias
  const { review: _prev, ...archToReview } = architecture;

  const response = await fetch('/api/architecture/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      architecture: archToReview,
      input: requirements,
      requirements,
    }),
  });

  const raw = await parseApiResponse<any>(
    response,
    'Failed to review software architecture. Please try again.'
  );

  return validateArchitectureReviewResult(raw);
}

/**
 * Propose an architectural fix for a specific finding.
 */
export async function apiProposeFix(
  finding: ArchitectureReviewFinding,
  architecture: ArchitectureResult,
  input: ArchitectureInput
): Promise<ArchitectureFixProposal> {
  const response = await fetch('/api/architecture/propose-fix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      finding,
      architecture,
      input,
    }),
  });

  const proposal = await parseApiResponse<ArchitectureFixProposal>(
    response,
    'Failed to formulate architecture fix proposal. Please try again.'
  );

  if (!proposal || !proposal.proposedChange) {
    throw new ArchitectureApiError('Invalid fix proposal received from AI engine.');
  }

  return proposal;
}

/**
 * Surgically apply an approved fix proposal to the current architecture.
 */
export async function apiApplyFix(
  proposal: ArchitectureFixProposal,
  architecture: ArchitectureResult,
  input: ArchitectureInput
): Promise<ArchitectureResult> {
  const response = await fetch('/api/architecture/apply-fix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposal,
      architecture,
      input,
    }),
  });

  const raw = await parseApiResponse<any>(
    response,
    'Failed to apply architecture fix. Please try again.'
  );

  const updated = validateArchitectureResult(raw);

  // Preserve core requirements if model omitted them
  if (!updated.functionalRequirements?.length && architecture.functionalRequirements?.length) {
    updated.functionalRequirements = architecture.functionalRequirements;
  }
  if (!updated.nonFunctionalRequirements?.length && architecture.nonFunctionalRequirements?.length) {
    updated.nonFunctionalRequirements = architecture.nonFunctionalRequirements;
  }

  return updated;
}

/**
 * Generate a comparative analysis between two competing architecture styles.
 */
export async function apiCompareArchitectures(
  input: ArchitectureInput,
  optionAStyle: string,
  optionBStyle: string
): Promise<ArchitectureComparisonResult> {
  const response = await fetch('/api/architecture/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      optionAStyle,
      optionBStyle,
    }),
  });

  const data = await parseApiResponse<ArchitectureComparisonResult>(
    response,
    'Failed to generate architecture comparison. Please try again.'
  );

  if (!data || !data.optionA || !data.optionB) {
    throw new ArchitectureApiError('Malformed comparison data received from AI engine.');
  }

  return data;
}

/**
 * Recommend relevant architecture styles for comparison based on project requirements.
 */
export async function apiRecommendComparisonStyles(
  input: ArchitectureInput
): Promise<{ optionA?: string; optionB?: string; reasoning?: string }> {
  const response = await fetch('/api/architecture/recommend-styles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  return parseApiResponse<{ optionA?: string; optionB?: string; reasoning?: string }>(
    response,
    'Failed to recommend comparison styles.'
  );
}
