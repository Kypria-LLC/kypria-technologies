exports.handler = async (event, context) => {
  console.log('Oracle invoked:', event.httpMethod, event.path);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Oracle awaits your proposal",
        timestamp: new Date().toISOString(),
        ritual: "active"
      })
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const proposalId = require('crypto').randomUUID();
    
    // 1. PROPOSAL RECEIVED
    const proposal = {
      id: proposalId,
      title: payload.title || "Unnamed Invocation",
      description: payload.description || "A matter for divine consideration",
      submittedBy: payload.submittedBy || "mortal-petitioner",
      submittedAt: new Date().toISOString(),
      status: "INVOKING_TRINITY"
    };

    // 2. AI WITNESS DELIBERATION (simulated divine logic)
    const witnesses = [
      {
        id: "zeus-witness",
        name: "Zeus",
        domain: "Power & Order",
        vote: Math.random() > 0.3 ? "approve" : "reject", // Zeus favors strength
        reasoning: "Evaluated for alignment with cosmic order"
      },
      {
        id: "aphrodite-witness", 
        name: "Aphrodite",
        domain: "Beauty & Connection",
        vote: Math.random() > 0.4 ? "approve" : "reject", // Aphrodite seeks harmony
        reasoning: "Assessed for potential to create beauty and bonds"
      },
      {
        id: "lifesphere-witness",
        name: "Lifesphere",
        domain: "Growth & Sustainability", 
        vote: Math.random() > 0.5 ? "approve" : "reject", // Lifesphere is balanced
        reasoning: "Measured against long-term flourishing"
      }
    ];

    // 3. DIVINE TALLY
    const approvals = witnesses.filter(w => w.vote === "approve").length;
    const decision = approvals >= 2 ? "APPROVED" : "REJECTED";
    const consensus = approvals === 3 ? "UNANIMOUS" : approvals === 0 ? "UNANIMOUS_REJECTION" : "SPLIT";

    // 4. ORACLE SPEAKS
    const oracleResponse = {
      ritual: "COMPLETE",
      timestamp: new Date().toISOString(),
      proposal: proposal,
      witnesses: witnesses,
      tally: {
        approvals: approvals,
        rejections: 3 - approvals,
        decision: decision,
        consensus: consensus,
        threshold: "2 of 3 required"
      },
      decree: decision === "APPROVED" 
        ? "The Trinity has spoken. This proposal shall manifest in the mortal realm."
        : "The Trinity withholds blessing. This path leads not to flourishing.",
      nextSteps: decision === "APPROVED"
        ? ["Execute proposal", "Notify community", "Record in Temple archives"]
        : ["Return to drawing board", "Seek divine inspiration", "Refine proposal"],
      sacredHash: require('crypto').createHash('sha256').update(proposalId + decision).digest('hex').substring(0, 12)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(oracleResponse, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Oracle connection disrupted",
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
