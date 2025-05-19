export interface Agent {
  id: string;
  path: string;
  name: string;
  avatar: string;
  description?: string; // Made optional to match toStoredAgent
  // Add other fields if necessary, but StoredAgent only keeps essential ones
}

// Define a lightweight interface for stored agents (same as before)
export interface StoredAgent {
  id: string;
  path: string;
  name: string;
  avatar: string;
  description: string;
}

/**
 * Converts a full Agent object to a minimal StoredAgent
 * This function is used by the renderer before sending data to the main process
 * for initialization or adding, if you pass full Agent objects to these functions.
 */
function toStoredAgent(agent: Agent): StoredAgent {
  return {
    id: agent.id,
    path: agent.path,
    name: agent.name,
    avatar: agent.avatar,
    description: agent.description ?? "",
  };
}

// --- IPC Channel Names (must match main.ts and preload.ts) ---
const CHANNELS = {
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear",
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
};

/**
 * Retrieves the list of recently selected agents from the file system.
 * @returns Promise<StoredAgent[]> Array of minimal agent objects.
 */
export async function getRecentlySelectedAgents(): Promise<StoredAgent[]> {
  try {
    if (window.electronAPI && typeof window.electronAPI.invoke === "function") {
      return await window.electronAPI.invoke(CHANNELS.GET_AGENTS);
    }
    console.warn(
      "electronAPI.invoke not available for getRecentlySelectedAgents. Returning empty array.",
    );
    return [];
  } catch (error) {
    console.error("Error invoking getRecentlySelectedAgents via IPC:", error);
    return [];
  }
}

/**
 * Adds an agent to the recently selected list in the file system.
 * @param agent - The full agent object to add.
 * @param maxItems - Maximum number of items to keep (default: 5).
 * @returns Promise<StoredAgent[]> The updated list of recently selected agents.
 */
export async function addAgentToRecentlySelected(
  agent: Agent | null, // Expecting full Agent object
  maxItems: number = 5,
): Promise<StoredAgent[]> {
  if (!agent?.id) {
    // If no agent is provided, or agent has no ID, return the current list without modification.
    return getRecentlySelectedAgents();
  }
  if (window.electronAPI && typeof window.electronAPI.invoke === "function") {
    // Convert to StoredAgent before sending over IPC
    return await window.electronAPI.invoke(
      CHANNELS.ADD_AGENT,
      toStoredAgent(agent),
      maxItems,
    );
  }
  console.warn(
    "electronAPI.invoke not available for addAgentToRecentlySelected. No changes made.",
  );
  return getRecentlySelectedAgents(); // Fallback: return current list
}

/**
 * Clears the recently selected agents list from the file system.
 * @returns Promise<void>
 */
export async function clearRecentlySelectedAgents(): Promise<void> {
  if (window.electronAPI && typeof window.electronAPI.invoke === "function") {
    await window.electronAPI.invoke(CHANNELS.CLEAR_AGENTS);
  } else {
    console.warn(
      "electronAPI.invoke not available for clearRecentlySelectedAgents. No changes made.",
    );
  }
}

/**
 * Removes a specific agent from the recently selected list in the file system.
 * @param agentId - ID of the agent to remove.
 * @returns Promise<StoredAgent[]> The updated list of recently selected agents.
 */
export async function removeAgentFromRecentlySelected(
  agentId: string,
): Promise<StoredAgent[]> {
  if (window.electronAPI && typeof window.electronAPI.invoke === "function") {
    return await window.electronAPI.invoke(CHANNELS.REMOVE_AGENT, agentId);
  }
  console.warn(
    "electronAPI.invoke not available for removeAgentFromRecentlySelected. No changes made.",
  );
  return getRecentlySelectedAgents(); // Fallback: return current list
}

/**
 * Populates with initial agents if the stored list is empty.
 * @param initialAgents - Array of initial full Agent objects to use if empty.
 * @returns Promise<StoredAgent[]> The list of recently selected agents (either newly initialized or existing).
 */
export async function initializeRecentlySelectedAgents(
  initialAgents: Agent[],
): Promise<StoredAgent[]> {
  if (window.electronAPI && typeof window.electronAPI.invoke === "function") {
    // Convert to StoredAgent before sending over IPC
    const agentsToStore = initialAgents.slice(0, 4).map(toStoredAgent);
    return await window.electronAPI.invoke(
      CHANNELS.INITIALIZE_AGENTS,
      agentsToStore,
    );
  }
  console.warn(
    "electronAPI.invoke not available for initializeRecentlySelectedAgents. No changes made.",
  );
  return getRecentlySelectedAgents(); // Fallback: return current list
}
