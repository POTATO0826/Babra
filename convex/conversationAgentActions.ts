"use node";

import { generateText, stepCountIs, tool } from "ai";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";
import MemoryClient from "mem0ai";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { activeModelLabel, buildChatModel } from "./aiModel";

type ClaimedAnalysis = {
  conversation: {
    _id: Id<"whatsappConversations">;
    advisorId: Id<"advisors">;
    participantPhone: string;
    participantName?: string;
    leadId?: Id<"leads">;
    clientId?: Id<"clients">;
  };
  lead: LeadSnapshot | null;
  client: ClientSnapshot | null;
  recentMessages: MessageSnapshot[];
  pendingMessageIds: Id<"whatsappMessages">[];
} | null;

type LeadSnapshot = {
  _id: Id<"leads">;
  name: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  age: number;
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Converted";
  serviceInterest:
    | "Retirement Planning"
    | "Investment Management"
    | "Insurance"
    | "Estate Planning"
    | "Tax Strategy"
    | "College Savings";
  estimatedPortfolio: number;
  situationTeaser: string;
  situation: string;
  whyApproached: string;
  notes: string[];
  timeline: Array<{ date: string; label: string }>;
};

type ClientSnapshot = {
  _id: Id<"clients">;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Onboarding" | "Review due";
  clientSince: string;
  serviceTopics: LeadSnapshot["serviceInterest"][];
  situation: string;
  whyApproached: string;
  notes: string[];
};

type MessageSnapshot = {
  _id: Id<"whatsappMessages">;
  direction: "Inbound" | "Outbound";
  senderName?: string;
  body: string;
  receivedAt: string;
  analysisStatus: "Pending" | "Processing" | "Processed" | "Failed";
};

type CompletionResult = { hasMorePending: boolean };

type Sentiment = "Positive" | "Neutral" | "Negative" | "Urgent";

const claimConversationAnalysis = makeFunctionReference<
  "mutation",
  { conversationId: Id<"whatsappConversations"> },
  ClaimedAnalysis
>("conversationAgent:claimConversationAnalysis");

const findLeadByPhone = makeFunctionReference<
  "query",
  { phone: string },
  LeadSnapshot | null
>("conversationAgent:findLeadByPhone");

const createLeadFromConversation = makeFunctionReference<
  "mutation",
  CreateLeadInput & { conversationId: Id<"whatsappConversations"> },
  LeadSnapshot | null
>("conversationAgent:createLeadFromConversation");

const updateLeadProfile = makeFunctionReference<
  "mutation",
  {
    leadId: Id<"leads">;
    patch: LeadProfilePatch;
    confidence: number;
    rationale: string;
  },
  { updated: boolean; reason?: string }
>("conversationAgent:updateLeadProfile");

const updateLeadStatus = makeFunctionReference<
  "mutation",
  {
    leadId: Id<"leads">;
    status: LeadSnapshot["status"];
    confidence: number;
    rationale: string;
  },
  { updated: boolean; reason?: string }
>("conversationAgent:updateLeadStatus");

const convertLeadToClient = makeFunctionReference<
  "mutation",
  {
    leadId: Id<"leads">;
    confidence: number;
    rationale: string;
  },
  {
    converted: boolean;
    reason?: string;
    clientId?: Id<"clients">;
    action?: string;
  }
>("conversationAgent:convertLeadToClient");

const appendLeadNote = makeFunctionReference<
  "mutation",
  { leadId: Id<"leads">; note: string; confidence: number },
  { updated: boolean; reason?: string }
>("conversationAgent:appendLeadNote");

const appendLeadTimelineEvent = makeFunctionReference<
  "mutation",
  { leadId: Id<"leads">; date: string; label: string; confidence: number },
  { updated: boolean; reason?: string }
>("conversationAgent:appendLeadTimelineEvent");

const createLeadFollowUpTask = makeFunctionReference<
  "mutation",
  {
    leadId: Id<"leads">;
    title: string;
    detail?: string;
    dueDate?: string;
  },
  Id<"advisorTasks">
>("conversationAgent:createLeadFollowUpTask");

const upsertMeetingFromConversation = makeFunctionReference<
  "mutation",
  MeetingInput & {
    conversationId: Id<"whatsappConversations">;
    leadId?: Id<"leads">;
    clientId?: Id<"clients">;
    confidence: number;
    rationale: string;
  },
  { updated: boolean; reason?: string; meetingId?: Id<"meetings">; action?: string }
>("conversationAgent:upsertMeetingFromConversation");

const storeClientActivity = makeFunctionReference<
  "mutation",
  ClientActivityInput & {
    conversationId: Id<"whatsappConversations">;
    messageId?: Id<"whatsappMessages">;
  },
  {
    stored: boolean;
    reason?: string;
    activityId?: Id<"clientActivities">;
  }
>("conversationAgent:storeClientActivity");

const completeConversationAnalysis = makeFunctionReference<
  "mutation",
  {
    conversationId: Id<"whatsappConversations">;
    messageIds: Id<"whatsappMessages">[];
    summary: string;
    sentiment: Sentiment;
    extractedFacts: ExtractedFact[];
    suggestedActions: SuggestedAction[];
    model?: string;
  },
  CompletionResult
>("conversationAgent:completeConversationAnalysis");

const failConversationAnalysis = makeFunctionReference<
  "mutation",
  {
    conversationId: Id<"whatsappConversations">;
    messageIds: Id<"whatsappMessages">[];
    error: string;
  },
  null
>("conversationAgent:failConversationAnalysis");

const analyzeConversationRef = makeFunctionReference<
  "action",
  { conversationId: Id<"whatsappConversations"> },
  null
>("conversationAgentActions:analyzeConversation");

const serviceInterestSchema = z.enum([
  "Retirement Planning",
  "Investment Management",
  "Insurance",
  "Estate Planning",
  "Tax Strategy",
  "College Savings",
]);

const leadStatusSchema = z.enum(["New", "Contacted", "Qualified", "Proposal"]);
const meetingModeSchema = z.enum(["Video", "Phone", "In-person"]);
const meetingStatusSchema = z.enum([
  "Confirmed",
  "Tentative",
  "Completed",
  "Canceled",
]);
const clientActivityCategorySchema = z.enum([
  "Travel",
  "Family",
  "Work",
  "Health",
  "Milestone",
  "Availability",
]);
const clientActivityPrioritySchema = z.enum(["Upcoming", "Recent", "Watch"]);

const createLeadInputSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  age: z.number().optional(),
  serviceInterest: serviceInterestSchema.optional(),
  estimatedPortfolio: z.number().optional(),
  situationTeaser: z.string().optional(),
  situation: z.string().optional(),
  whyApproached: z.string().optional(),
});

const leadProfilePatchSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  age: z.number().optional(),
  serviceInterest: serviceInterestSchema.optional(),
  estimatedPortfolio: z.number().optional(),
  situationTeaser: z.string().optional(),
  situation: z.string().optional(),
  whyApproached: z.string().optional(),
  lastContact: z.string().optional(),
});

const meetingInputSchema = z.object({
  title: z.string(),
  attendeeRole: z.string().optional(),
  start: z.string(),
  durationMinutes: z.number(),
  mode: meetingModeSchema,
  location: z.string(),
  status: meetingStatusSchema,
  topic: serviceInterestSchema,
  purpose: z.string(),
  agenda: z.array(z.string()),
});

const clientActivityInputSchema = z.object({
  clientId: z.string(),
  messageId: z.string().optional(),
  category: clientActivityCategorySchema,
  activity: z.string(),
  timeframe: z.string(),
  mentionedAt: z.string(),
  suggestedTouchpoint: z.string(),
  priority: clientActivityPrioritySchema,
  confidence: z.number(),
  rationale: z.string(),
});

type CreateLeadInput = z.infer<typeof createLeadInputSchema>;
type LeadProfilePatch = z.infer<typeof leadProfilePatchSchema>;
type MeetingInput = z.infer<typeof meetingInputSchema>;
type ClientActivityInput = {
  clientId: Id<"clients">;
  messageId?: Id<"whatsappMessages">;
  category: z.infer<typeof clientActivityCategorySchema>;
  activity: string;
  timeframe: string;
  mentionedAt: string;
  suggestedTouchpoint: string;
  priority: z.infer<typeof clientActivityPrioritySchema>;
  confidence: number;
  rationale: string;
};
type ExtractedFact = {
  target: "Lead" | "Client" | "Meeting" | "Profile";
  field: string;
  value: string;
  confidence: number;
};
type SuggestedAction = {
  type:
    | "UpdateLead"
    | "UpdateClient"
    | "ScheduleMeeting"
    | "CreateTask"
    | "NoAction";
  title: string;
  rationale: string;
  confidence: number;
};

export const analyzeConversation = internalAction({
  args: { conversationId: v.id("whatsappConversations") },
  handler: async (ctx, args) => {
    const claimed: ClaimedAnalysis = await ctx.runMutation(
      claimConversationAnalysis,
      args,
    );
    if (!claimed) return null;

    try {
      const model = buildChatModel("conversation analysis");
      const memories = await searchMemories(claimed.conversation.participantPhone);
      const facts: ExtractedFact[] = [];
      const actions: SuggestedAction[] = [];
      const result = await generateText({
        model,
        system: buildSystemPrompt(),
        prompt: buildUserPrompt(claimed, memories),
        tools: buildTools(ctx, claimed, facts, actions),
        stopWhen: stepCountIs(8),
        maxOutputTokens: 1400,
      });

      const completion: CompletionResult = await ctx.runMutation(
        completeConversationAnalysis,
        {
          conversationId: args.conversationId,
          messageIds: claimed.pendingMessageIds,
          summary: result.text.trim() || "Conversation analyzed.",
          sentiment: inferSentiment(result.text),
          extractedFacts: facts.slice(0, 20),
          suggestedActions: actions.slice(0, 20),
          model: activeModelLabel(),
        },
      );

      if (completion.hasMorePending) {
        await ctx.scheduler.runAfter(0, analyzeConversationRef, args);
      }
      return null;
    } catch (error) {
      await ctx.runMutation(failConversationAnalysis, {
        conversationId: args.conversationId,
        messageIds: claimed.pendingMessageIds,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },
});

function buildTools(
  ctx: ActionCtx,
  claimed: NonNullable<ClaimedAnalysis>,
  facts: ExtractedFact[],
  actions: SuggestedAction[],
) {
  return {
    findLeadByPhone: tool({
      description:
        "Find an existing lead by exact phone number. Use this before creating a new lead when the conversation is not already linked to a lead, or when you need to verify whether the WhatsApp participant already exists in the lead pipeline.",
      inputSchema: z.object({ phone: z.string() }),
      execute: async ({ phone }) => {
        return await runLoggedTool(claimed, "findLeadByPhone", { phone }, () =>
          ctx.runQuery(findLeadByPhone, { phone }),
        );
      },
    }),
    createLeadFromConversation: tool({
      description:
        "Create a lead for this WhatsApp conversation. This is required when there is no linked lead/client and the sender shows prospect intent: asking for financial advice, saying they are interested, asking about services/fees/appointments, sharing a financial goal/problem, requesting help, or positively responding to the advisor's offer. Do not wait for full qualification details. Do not use if an existing lead or client is already linked or can be found by phone.",
      inputSchema: createLeadInputSchema,
      execute: async (input) => {
        return await runLoggedTool(
          claimed,
          "createLeadFromConversation",
          input,
          async () => {
            actions.push({
              type: "UpdateLead",
              title: "Created lead from WhatsApp conversation",
              rationale: "The conversation did not have a linked lead.",
              confidence: 0.9,
            });
            const lead = await ctx.runMutation(createLeadFromConversation, {
              conversationId: claimed.conversation._id,
              ...input,
            });
            if (lead) {
              await syncActionMemory(
                claimed,
                `Source truth update: WhatsApp contact is now a lead named ${lead.name}. Service interest: ${lead.serviceInterest}. Status: ${lead.status}. Context: ${lead.situationTeaser}`,
                {
                  action: "createLeadFromConversation",
                  leadId: lead._id,
                  status: lead.status,
                  serviceInterest: lead.serviceInterest,
                },
              );
            }
            return lead;
          },
        );
      },
    }),
    updateLeadProfile: tool({
      description:
        "Update stable lead profile fields such as name, email, phone, location, occupation, age, service interest, portfolio estimate, situation, or reason for reaching out. Use only when the participant clearly states or confirms the information. Do not guess, infer demographics, or overwrite known fields from vague context.",
      inputSchema: z.object({
        leadId: z.string(),
        patch: leadProfilePatchSchema,
        confidence: z.number(),
        rationale: z.string(),
      }),
      execute: async ({ leadId, patch, confidence, rationale }) => {
        return await runLoggedTool(
          claimed,
          "updateLeadProfile",
          { leadId, patch, confidence, rationale },
          async () => {
            for (const [field, value] of Object.entries(patch)) {
              if (value !== undefined) {
                facts.push({
                  target: "Lead",
                  field,
                  value: String(value),
                  confidence,
                });
              }
            }
            actions.push({
              type: "UpdateLead",
              title: "Updated lead profile",
              rationale,
              confidence,
            });
            const result = await ctx.runMutation(updateLeadProfile, {
              leadId: leadId as Id<"leads">,
              patch,
              confidence,
              rationale,
            });
            if (result.updated) {
              await syncActionMemory(
                claimed,
                `Source truth update: Lead profile updated. Fields: ${Object.keys(patch).join(", ")}. Reason: ${rationale}`,
                {
                  action: "updateLeadProfile",
                  leadId,
                  confidence,
                  fields: Object.keys(patch),
                },
              );
            }
            return result;
          },
        );
      },
    }),
    updateLeadStatus: tool({
      description:
        "Move a lead through the active pipeline stages: New, Contacted, Qualified, or Proposal. Use when the newest conversation clearly supports a pipeline change, such as a first reply, qualification details, or proposal discussion. Do not use this for client conversion; use convertLeadToClient when the lead has become a client.",
      inputSchema: z.object({
        leadId: z.string(),
        status: leadStatusSchema,
        confidence: z.number(),
        rationale: z.string(),
      }),
      execute: async ({ leadId, status, confidence, rationale }) => {
        return await runLoggedTool(
          claimed,
          "updateLeadStatus",
          { leadId, status, confidence, rationale },
          async () => {
            actions.push({
              type: "UpdateLead",
              title: `Set lead status to ${status}`,
              rationale,
              confidence,
            });
            const result = await ctx.runMutation(updateLeadStatus, {
              leadId: leadId as Id<"leads">,
              status,
              confidence,
              rationale,
            });
            if (result.updated) {
              await syncActionMemory(
                claimed,
                `Source truth update: Lead status changed to ${status}. Reason: ${rationale}`,
                {
                  action: "updateLeadStatus",
                  leadId,
                  status,
                  confidence,
                },
              );
            }
            return result;
          },
        );
      },
    }),
    convertLeadToClient: tool({
      description:
        "Convert an existing lead into a client profile. Use this tool whenever the conversation clearly indicates the lead has become a client, including accepted proposal, signed-up language, onboarding agreement, or an advisor message confirming the person is being onboarded/accepted as a client. Do not use for ordinary interest, a scheduled meeting, or vague encouragement.",
      inputSchema: z.object({
        leadId: z.string(),
        confidence: z.number(),
        rationale: z.string(),
      }),
      execute: async ({ leadId, confidence, rationale }) => {
        return await runLoggedTool(
          claimed,
          "convertLeadToClient",
          { leadId, confidence, rationale },
          async () => {
            actions.push({
              type: "UpdateClient",
              title: "Converted lead to client",
              rationale,
              confidence,
            });
            const result = await ctx.runMutation(convertLeadToClient, {
              leadId: leadId as Id<"leads">,
              confidence,
              rationale,
            });
            if (result.converted) {
              await syncActionMemory(
                claimed,
                `Source truth update: Lead converted to client. Reason: ${rationale}`,
                {
                  action: "convertLeadToClient",
                  leadId,
                  clientId: result.clientId,
                  confidence,
                },
              );
            }
            return result;
          },
        );
      },
    }),
    appendLeadNote: tool({
      description:
        "Append a concise advisor note to the lead. Use for useful qualitative context that should be visible to the advisor, such as preferences, constraints, stated goals, missing information, meeting preferences, or important conversation milestones. Do not duplicate existing notes or store trivial chat acknowledgements.",
      inputSchema: z.object({
        leadId: z.string(),
        note: z.string(),
        confidence: z.number(),
      }),
      execute: async ({ leadId, note, confidence }) => {
        return await runLoggedTool(
          claimed,
          "appendLeadNote",
          { leadId, note, confidence },
          async () => {
            facts.push({ target: "Lead", field: "note", value: note, confidence });
            const result = await ctx.runMutation(appendLeadNote, {
              leadId: leadId as Id<"leads">,
              note,
              confidence,
            });
            if (result.updated) {
              await syncActionMemory(
                claimed,
                `Source truth update: Advisor note added to lead. Note: ${note}`,
                {
                  action: "appendLeadNote",
                  leadId,
                  confidence,
                },
              );
            }
            return result;
          },
        );
      },
    }),
    appendLeadTimelineEvent: tool({
      description:
        "Add a dated timeline event to the lead. Use for meaningful milestones such as lead creation, qualification, meeting confirmation, proposal sent, onboarding, or other date-specific events. Do not use for ordinary back-and-forth messages or facts that are better stored as notes.",
      inputSchema: z.object({
        leadId: z.string(),
        date: z.string(),
        label: z.string(),
        confidence: z.number(),
      }),
      execute: async ({ leadId, date, label, confidence }) => {
        return await runLoggedTool(
          claimed,
          "appendLeadTimelineEvent",
          { leadId, date, label, confidence },
          async () => {
            actions.push({
              type: "UpdateLead",
              title: "Added lead timeline event",
              rationale: label,
              confidence,
            });
            const result = await ctx.runMutation(appendLeadTimelineEvent, {
              leadId: leadId as Id<"leads">,
              date,
              label,
              confidence,
            });
            if (result.updated) {
              await syncActionMemory(
                claimed,
                `Source truth update: Lead timeline event added for ${date}: ${label}`,
                {
                  action: "appendLeadTimelineEvent",
                  leadId,
                  date,
                  confidence,
                },
              );
            }
            return result;
          },
        );
      },
    }),
    createLeadFollowUpTask: tool({
      description:
        "Create an advisor follow-up task tied to a lead. Use when the conversation creates a future action for the advisor, such as sending documents, following up on missing details, confirming a time/location, or checking back on a deadline. Do not use for actions already completed in the conversation.",
      inputSchema: z.object({
        leadId: z.string(),
        title: z.string(),
        detail: z.string().optional(),
        dueDate: z.string().optional(),
      }),
      execute: async ({ leadId, title, detail, dueDate }) => {
        return await runLoggedTool(
          claimed,
          "createLeadFollowUpTask",
          { leadId, title, detail, dueDate },
          async () => {
            actions.push({
              type: "CreateTask",
              title,
              rationale: detail ?? "Follow-up requested by conversation analysis.",
              confidence: 0.8,
            });
            const taskId = await ctx.runMutation(createLeadFollowUpTask, {
              leadId: leadId as Id<"leads">,
              title,
              detail,
              dueDate,
            });
            await syncActionMemory(
              claimed,
              `Source truth update: Follow-up task created for lead. Task: ${title}. Due: ${dueDate ?? "not set"}. Detail: ${detail ?? "none"}`,
              {
                action: "createLeadFollowUpTask",
                leadId,
                taskId,
                dueDate,
              },
            );
            return taskId;
          },
        );
      },
    }),
    upsertMeetingFromConversation: tool({
      description:
        "Create or update a meeting in the schedule. Use only when the conversation includes a clear meeting date, time, participant acceptance, meeting mode, and enough location/link/phone context for the advisor to act. If the participant only expresses preference or interest without accepting a specific slot, create a follow-up task instead.",
      inputSchema: meetingInputSchema.extend({
        leadId: z.string().optional(),
        clientId: z.string().optional(),
        confidence: z.number(),
        rationale: z.string(),
      }),
      execute: async ({
        leadId,
        clientId,
        confidence,
        rationale,
        ...meeting
      }) => {
        return await runLoggedTool(
          claimed,
          "upsertMeetingFromConversation",
          { leadId, clientId, confidence, rationale, ...meeting },
          async () => {
            facts.push({
              target: "Meeting",
              field: "start",
              value: meeting.start,
              confidence,
            });
            actions.push({
              type: "ScheduleMeeting",
              title: meeting.title,
              rationale,
              confidence,
            });
            const result = await ctx.runMutation(upsertMeetingFromConversation, {
              conversationId: claimed.conversation._id,
              leadId: leadId as Id<"leads"> | undefined,
              clientId: clientId as Id<"clients"> | undefined,
              confidence,
              rationale,
              ...meeting,
            });
            if (result.updated) {
              await syncActionMemory(
                claimed,
                `Source truth update: Meeting ${result.action ?? "saved"}: ${meeting.title} at ${meeting.start}. Purpose: ${meeting.purpose}`,
                {
                  action: "upsertMeetingFromConversation",
                  meetingId: result.meetingId,
                  leadId,
                  clientId,
                  start: meeting.start,
                  confidence,
                },
              );
            }
            return result;
          },
        );
      },
    }),
    storeMemoryFact: tool({
      description:
        "Store a durable lead or client memory in Mem0. Use for stable facts that should help future conversations, such as goals, preferences, constraints, language, location, occupation, family context, risk tolerance, financial concerns, service interest, portfolio context, or lead/client status. Use this even when the person is only a lead/prospect and not yet a client. Do not use this for relationship activity/life updates that should appear on the Activity page for linked clients; use storeClientActivityMemory for those. Do not store advisor names as client nicknames, transient scheduling chatter, or facts from outbound advisor identity metadata.",
      inputSchema: z.object({
        fact: z.string(),
        category: z.string(),
        confidence: z.number(),
      }),
      execute: async ({ fact, category, confidence }) => {
        return await runLoggedTool(
          claimed,
          "storeMemoryFact",
          { fact, category, confidence },
          async () => {
            facts.push({
              target: "Profile",
              field: category,
              value: fact,
              confidence,
            });
            await addMemory(claimed.conversation.participantPhone, fact, {
              category,
              confidence,
              conversationId: claimed.conversation._id,
            });
            return { stored: true };
          },
        );
      },
    }),
    storeClientActivityMemory: tool({
      description:
        "Store client activity for relationship maintenance in Convex and Mem0. Use when a linked client mentions a personal/professional life update, upcoming plan, recent event, availability constraint, milestone, health/family/work/travel context, or other human context the advisor should remember and may follow up on. Use only for facts about the client, not the advisor. Do not use for generic greetings, trivial small talk, vague feelings, ordinary scheduling logistics, or lead-only prospects without a clientId.",
      inputSchema: clientActivityInputSchema,
      execute: async ({
        clientId,
        messageId,
        category,
        activity,
        timeframe,
        mentionedAt,
        suggestedTouchpoint,
        priority,
        confidence,
        rationale,
      }) => {
        return await runLoggedTool(
          claimed,
          "storeClientActivityMemory",
          {
            clientId,
            messageId,
            category,
            activity,
            timeframe,
            mentionedAt,
            suggestedTouchpoint,
            priority,
            confidence,
            rationale,
          },
          async () => {
            facts.push({
              target: "Profile",
              field: `client_activity:${category}`,
              value: `${activity} (${timeframe})`,
              confidence,
            });
            actions.push({
              type: "UpdateClient",
              title: "Stored client activity",
              rationale,
              confidence,
            });
            const result = await ctx.runMutation(storeClientActivity, {
              conversationId: claimed.conversation._id,
              clientId: clientId as Id<"clients">,
              messageId: messageId as Id<"whatsappMessages"> | undefined,
              category,
              activity,
              timeframe,
              mentionedAt,
              suggestedTouchpoint,
              priority,
              confidence,
              rationale,
            });
            if (result.stored) {
              await addMemory(
                claimed.conversation.participantPhone,
                `Client activity: ${activity}. Timeframe: ${timeframe}. Suggested touchpoint: ${suggestedTouchpoint}`,
                {
                  category: "client_activity",
                  activityCategory: category,
                  priority,
                  confidence,
                  conversationId: claimed.conversation._id,
                  clientId,
                  activityId: result.activityId,
                },
              );
            }
            return result;
          },
        );
      },
    }),
  };
}

async function runLoggedTool<TResult>(
  claimed: NonNullable<ClaimedAnalysis>,
  toolName: string,
  input: unknown,
  operation: () => Promise<TResult>,
) {
  const startedAt = Date.now();
  const base = {
    conversationId: claimed.conversation._id,
    toolName,
    participantPhone: maskPhoneForLog(claimed.conversation.participantPhone),
    linkedLeadId: claimed.conversation.leadId,
    linkedClientId: claimed.conversation.clientId,
  };

  console.info("[conversation-agent-tool]", "start", {
    ...base,
    input: sanitizeLogValue(input),
  });

  try {
    const result = await operation();
    console.info("[conversation-agent-tool]", "success", {
      ...base,
      elapsedMs: Date.now() - startedAt,
      result: sanitizeLogValue(result),
    });
    return result;
  } catch (error) {
    console.error("[conversation-agent-tool]", "error", {
      ...base,
      elapsedMs: Date.now() - startedAt,
      error: getErrorMessage(error),
    });
    throw error;
  }
}

async function syncActionMemory(
  claimed: NonNullable<ClaimedAnalysis>,
  fact: string,
  metadata: Record<string, unknown>,
) {
  await addMemory(claimed.conversation.participantPhone, fact, compactMetadata({
    category: "source_truth_sync",
    conversationId: claimed.conversation._id,
    leadId: claimed.conversation.leadId,
    clientId: claimed.conversation.clientId,
    ...metadata,
  }));
}

function buildSystemPrompt() {
  return [
    "You are an assistant for one financial advisor using WhatsApp with leads.",
    "Analyze only the provided conversation context and existing lead/client state.",
    "Use tools to create or update Convex records; do not claim an update happened unless a tool succeeds.",
    "The newest pending messages are the reason you were called. Evaluate them first, then use prior messages only as context.",
    "Be conservative. Do not infer exact age, portfolio, meeting date, or pipeline status from vague language.",
    "Lead creation rule: if there is no linked lead/client and no existing lead by phone, you must call createLeadFromConversation when the sender shows prospect intent.",
    "Prospect intent includes: saying they are interested, asking for help/advice, asking about services/fees/appointment availability, sharing a financial goal or concern, asking what to do next, or positively replying to an advisor offer.",
    "Do not require complete profile details before creating a lead. Use only known fields and let createLeadFromConversation fill safe defaults for missing fields.",
    "Do not merely summarize prospect interest. Create or link the lead first, then summarize the completed update.",
    "Lead-to-client conversion rule: if a linked lead has no linked client and the newest messages clearly show onboarding, accepted proposal, signed-up language, or advisor confirmation that the person is being onboarded/accepted as a client, you must call convertLeadToClient.",
    "Advisor outbound messages are authoritative business state. If the advisor tells the contact they are now a client, will be onboarded as a client, or are accepted as a client, convert the lead even if the client did not say the exact words.",
    "Do not merely summarize a clear client-conversion event. Call convertLeadToClient first, then summarize the completed update.",
    "Do not convert from vague encouragement, a scheduled meeting, or ordinary interest alone.",
    "Only schedule or update a meeting when the conversation includes a specific date/time and clear acceptance in the same context.",
    "When scheduling, convert the meeting start to an ISO datetime. The advisor is in Asia/Kuala_Lumpur unless context says otherwise.",
    "If a linked client exists, treat the person as a client and avoid lead-only status changes.",
    "Store durable lead and client facts in Mem0 with storeMemoryFact.",
    "When a lead/prospect shares stable details about themselves, their goals, financial situation, preferences, constraints, occupation, location, family context, risk tolerance, service interest, or portfolio context, call storeMemoryFact even if they are not yet a client.",
    "After source-of-truth updates, Mem0 is automatically synchronized by the tool implementation; do not duplicate those same action-sync memories unless there is an additional stable fact to store.",
    "For client relationship activity, use storeClientActivityMemory instead of generic memory. This includes life events, upcoming plans, recent events, family/work/travel/health updates, milestones, and availability context that could help the advisor maintain the relationship.",
    "Only store client activity when there is a linked clientId. Do not store advisor-side activity or outbound sender identity as client activity.",
    "Do not store generic greetings, trivial small talk, or ordinary scheduling logistics as client activity.",
    "Return a short operational summary for the advisor after tool use.",
  ].join("\n");
}

function buildUserPrompt(claimed: NonNullable<ClaimedAnalysis>, memories: string[]) {
  const conversation = claimed.conversation;
  const messages = formatMessages(claimed.recentMessages, conversation);
  const pendingMessages = formatMessages(
    claimed.recentMessages.filter((message) =>
      claimed.pendingMessageIds.includes(message._id),
    ),
    conversation,
  );

  return [
    `Current time: ${new Date().toISOString()} (advisor timezone: Asia/Kuala_Lumpur)`,
    `Participant phone: ${conversation.participantPhone}`,
    `Participant name: ${conversation.participantName ?? "Unknown"}`,
    `Linked lead: ${claimed.lead ? JSON.stringify(claimed.lead) : "None"}`,
    `Linked client: ${claimed.client ? JSON.stringify(claimed.client) : "None"}`,
    `Relevant memories: ${memories.length > 0 ? memories.join(" | ") : "None"}`,
    "Newest pending messages to analyze:",
    pendingMessages || "None",
    "Recent WhatsApp messages:",
    messages,
  ].join("\n\n");
}

function formatMessages(
  messages: MessageSnapshot[],
  conversation: NonNullable<ClaimedAnalysis>["conversation"],
) {
  return messages
    .map((message) => {
      const speaker =
        message.direction === "Inbound"
          ? conversation.participantName ?? conversation.participantPhone
          : "Advisor";
      return `[${message.receivedAt}] ${speaker}: ${message.body}`;
    })
    .join("\n");
}

async function searchMemories(phone: string) {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) return [];
  try {
    const mem0 = new MemoryClient({ apiKey });
    const response = await mem0.search("financial advisor lead context", {
      filters: { user_id: memoryUserId(phone) },
      topK: 5,
    });
    return response.results
      .map((memory) => memory.memory)
      .filter((memory): memory is string => Boolean(memory));
  } catch (error) {
    console.warn("[conversation-agent] Mem0 search failed", error);
    return [];
  }
}

async function addMemory(
  phone: string,
  fact: string,
  metadata: Record<string, unknown>,
) {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) return;
  try {
    const mem0 = new MemoryClient({ apiKey });
    await mem0.add([{ role: "user", content: fact }], {
      userId: memoryUserId(phone),
      metadata,
    });
  } catch (error) {
    console.warn("[conversation-agent] Mem0 add failed", error);
  }
}

function memoryUserId(phone: string) {
  return `whatsapp:${phone}`;
}

function inferSentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  if (lower.includes("urgent") || lower.includes("asap")) return "Urgent";
  if (lower.includes("concern") || lower.includes("problem")) return "Negative";
  if (lower.includes("interested") || lower.includes("confirmed")) {
    return "Positive";
  }
  return "Neutral";
}

function sanitizeLogValue(value: unknown): unknown {
  if (typeof value === "string") return truncateForLog(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 8).map((item) => sanitizeLogValue(item));
  }
  if (typeof value === "object" && value) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sanitizeFieldForLog(key, item),
      ]),
    );
  }
  return String(value);
}

function sanitizeFieldForLog(key: string, value: unknown): unknown {
  const lowerKey = key.toLowerCase();
  if (typeof value === "string" && lowerKey.includes("phone")) {
    return maskPhoneForLog(value);
  }
  if (
    typeof value === "string" &&
    (lowerKey.includes("body") ||
      lowerKey.includes("note") ||
      lowerKey.includes("fact") ||
      lowerKey.includes("activity") ||
      lowerKey.includes("rationale") ||
      lowerKey.includes("summary") ||
      lowerKey.includes("detail"))
  ) {
    return truncateForLog(value);
  }
  return sanitizeLogValue(value);
}

function truncateForLog(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
}

function compactMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined),
  );
}

function maskPhoneForLog(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return "****";
  return `${"*".repeat(Math.max(digits.length - 4, 0))}${digits.slice(-4)}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
