export function formatSuggestedTouchpoint(
  suggestedTouchpoint: string,
  activity: string,
  category: string,
) {
  if (looksActionable(suggestedTouchpoint)) return suggestedTouchpoint;

  if (category === "Travel") {
    const place = extractPlace(activity);
    return place
      ? `Wish them a safe and enjoyable trip to ${place}, and ask what they are most excited to explore.`
      : "Wish them a safe and enjoyable trip, and ask what they are most excited to explore.";
  }

  if (category === "Family") {
    return "Ask how the family is doing and mention you hope everyone is enjoying the moment together.";
  }

  if (category === "Work") {
    return "Check in on how work has been going and ask whether the recent update has changed their plans.";
  }

  if (category === "Health") {
    return "Check in gently and wish them good health, without pushing for private details.";
  }

  if (category === "Milestone") {
    return "Congratulate them on the milestone and ask how they are celebrating.";
  }

  if (category === "Availability") {
    return "Mention the timing and ask what would be convenient for a quick follow-up.";
  }

  return "Use this as a warm conversation starter and ask how things have been going.";
}

function looksActionable(value: string) {
  return /^(ask|wish|congratulate|check|mention|send|follow up|reach out|invite|share|remind|offer)\b/i.test(
    value.trim(),
  );
}

function extractPlace(activity: string) {
  const match =
    activity.match(
      /\b(?:to|in|at|visiting|visited)\s+([A-Z][A-Za-z\s]+?)(?:\s+with|\s+during|\s+including|[,.]|$)/,
    ) ??
    activity.match(
      /\b([A-Z][A-Za-z\s]+(?:City|Japan|Tokyo|Shanghai|Shibuya|Shinjuku))\b/,
    );
  return match?.[1]?.trim();
}
