// Seed Database for LearnFlow offline execution
export const seedDatabase = (entityName) => {
  const seeds = {
    User: [
      { id: 'usr-admin', full_name: 'Alex Mercer', email: 'alex.mercer@learnflow.industrial', role: 'admin', created_date: '2026-01-01T00:00:00.000Z' },
      { id: 'usr-supervisor', full_name: 'Sarah Connor', email: 'sarah.connor@learnflow.industrial', role: 'admin', created_date: '2026-01-01T00:00:00.000Z' }, // treating supervisor as admin for dashboard view
      { id: 'usr-operator', full_name: 'John Doe', email: 'john.doe@learnflow.industrial', role: 'user', created_date: '2026-01-02T00:00:00.000Z' },
      { id: 'usr-learner-2', full_name: 'Jane Smith', email: 'jane.smith@learnflow.industrial', role: 'user', created_date: '2026-01-03T00:00:00.000Z' }
    ],
    Process: [
      {
        id: 'proc-loto',
        title: 'Lockout Tagout (LOTO) Safety Protocol',
        description: 'Standard safety procedure to ensure dangerous machines are properly shut off and not started up again prior to the completion of maintenance or servicing work.',
        category: 'safety',
        difficulty_level: 'intermediate',
        estimated_duration: 25,
        content_type: 'interactive',
        hazard_level: 'high',
        grants_certification_id: 'cert-safety-spec',
        is_published: true,
        safety_requirements: ['Impact safety glasses', 'High voltage gloves', 'LOTO lock and tag kit'],
        compliance_codes: ['OSHA 1910.147', 'ISO 45001'],
        steps: [
          { title: 'Preparation for Shutdown', description: 'Identify the energy types, sources, and hazards. Notify affected employees.', safety_warnings: ['Do not proceed if machine is currently operational.'], quality_criteria: ['Verify LOTO log book entry.'] },
          { title: 'Machine Isolation', description: 'Shut down the machine using normal controls. Locate and isolate all energy isolating devices.', safety_warnings: ['Release stored residual energy (pneumatic/hydraulic pressure).'], quality_criteria: ['Ensure pressure gauges read zero.'] },
          { title: 'Apply Lockout/Tagout Devices', description: 'Affix personal locks and tags to the energy isolating devices.', safety_warnings: ['Locks must be personally owned and labeled.'], quality_criteria: ['Tag must contain name, date, and reason.'] },
          { title: 'Verification of Isolation', description: 'Verify that the machine is isolated by attempting to start it using normal start controls.', safety_warnings: ['Ensure no personnel are in the hazard zone during verification.'], quality_criteria: ['Machine must not start. Return controls to OFF.'] }
        ]
      },
      {
        id: 'proc-assembly',
        title: 'Mechanical Assembly of CNC Rotor Shaft',
        description: 'Detailed instructions for mechanical press fitting, alignment, and final assembly of the rotor shaft on high-precision CNC mills.',
        category: 'assembly',
        difficulty_level: 'advanced',
        estimated_duration: 45,
        content_type: 'ar_guided',
        hazard_level: 'low',
        grants_certification_id: 'cert-cnc-operator',
        is_published: true,
        safety_requirements: ['Standard safety shoes', 'ANSI cut-resistant gloves'],
        compliance_codes: ['ISO 9001', 'ASME Y14.5'],
        steps: [
          { title: 'Part Inspection & Prep', description: 'Verify rotor shaft dimensions and inspect keyway slots for burrs.', safety_warnings: [], quality_criteria: ['Rotor shaft diameter must match specs +/- 0.005mm.'] },
          { title: 'Shaft Alignment & Bearing Press', description: 'Pre-heat housing to 80°C and align shaft. Smoothly press bearings to shoulder.', safety_warnings: ['Housing is hot. Use thermal gloves.'], quality_criteria: ['Bearing shoulder seating must be flush.'] }
        ]
      },
      {
        id: 'proc-maintenance',
        title: 'Hydraulic Press Filter Replacement',
        description: 'Step-by-step procedure for replacing the primary and secondary fluid filters on the 500-ton hydraulic press.',
        category: 'maintenance',
        difficulty_level: 'intermediate',
        estimated_duration: 30,
        content_type: 'video',
        hazard_level: 'high',
        grants_certification_id: null,
        is_published: true,
        safety_requirements: ['Oil-resistant apron', 'Safety goggles'],
        compliance_codes: ['ISO 4406'],
        steps: [
          { title: 'Depressurize Hydraulics', description: 'Engage safety blocks and cycle control valves to release internal pressure.', safety_warnings: ['High pressure fluid injection hazard.'], quality_criteria: ['Pressure gauge must read 0 PSI.'] },
          { title: 'Filter Housing Removal', description: 'Unscrew housing caps using the spanner wrench. Collect waste oil in basin.', safety_warnings: [], quality_criteria: ['Do not damage the O-ring seals.'] }
        ]
      }
    ],
    LearningPath: [
      {
        id: 'path-onboarding',
        title: 'Industrial Operator Foundation Path',
        description: 'Core competencies for all new operators starting on the floor, covering safety fundamentals and basic assembly.',
        difficulty_level: 'beginner',
        estimated_duration: 120,
        created_date: '2026-01-01T00:00:00.000Z',
        steps: [
          { order: 1, process_id: 'proc-loto' },
          { order: 2, process_id: 'proc-assembly' }
        ]
      }
    ],
    Certification: [
      {
        id: 'cert-safety-spec',
        title: 'Certified Safety Specialist (LOTO)',
        description: 'Validates complete mastery over lockout tagout protocols and hazardous energy control.',
        renewal_process_id: 'proc-loto', // maps to itself for renewal
        created_date: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'cert-cnc-operator',
        title: 'CNC Precision Machinist Certification',
        description: 'Demonstrates capability in mechanical alignment, setup, and precision assembly of CNC shaft components.',
        renewal_process_id: 'proc-assembly',
        created_date: '2026-01-01T00:00:00.000Z'
      }
    ],
    Equipment: [
      { id: 'eq-cnc-01', device_name: 'CNC Milling Center Haas VF-2', device_type: 'CNC Mill', location: 'Section B (Machining)', status: 'online', connection_protocol: 'Modbus TCP', device_id: 'HAAS_VF2_01', firmware_version: 'v4.12.0', last_maintenance: '2026-05-10T00:00:00.000Z' },
      { id: 'eq-press-02', device_name: 'Hydraulic Press 500T-02', device_type: 'Hydraulic Press', location: 'Section A (Presses)', status: 'online', connection_protocol: 'OPC UA', device_id: 'PRESS_500T_02', firmware_version: 'v2.8.1', last_maintenance: '2026-06-15T00:00:00.000Z' }
    ],
    Notification: [
      { id: 'notif-1', user_id: 'usr-operator', message: 'Welcome to LearnFlow! Start your "Lockout Tagout" training today.', type: 'info', is_read: false, created_date: '2026-07-15T10:00:00.000Z' }
    ],
    Badge: [
      { id: 'bdg-safety', name: 'Safety First', description: 'Earned by completing Lockout Tagout (LOTO) Safety Protocol.', icon_url: 'Shield' },
      { id: 'bdg-precision', name: 'Precision Alignment', description: 'Earned by completing mechanical CNC shaft press assembly with zero tolerance errors.', icon_url: 'Target' }
    ],
    UserProgress: [
      { id: 'prog-loto-op', created_by_id: 'usr-operator', process_id: 'proc-loto', status: 'certified', completion_percentage: 100, certification_expiry: '2026-08-15T12:00:00.000Z', updated_date: '2026-07-10T12:00:00.000Z' },
      { id: 'prog-assembly-op', created_by_id: 'usr-operator', process_id: 'proc-assembly', status: 'in_progress', completion_percentage: 50, updated_date: '2026-07-14T15:30:00.000Z' }
    ],
    SupervisorReview: [
      { id: 'rev-1', created_by_id: 'usr-supervisor', user_id: 'usr-operator', process_id: 'proc-loto', rating: 5, comments: 'Excellent execution of verification step. Followed all safety boundaries.', created_date: '2026-07-10T12:30:00.000Z' }
    ],
    FeedbackRequest: [
      { id: 'fb-1', process_id: 'proc-loto', feedback_type: 'safety_concern', priority: 'high', title: 'LOTO Lock Box Wear', description: 'Main energy isolator padlock hasp showing significant signs of wear. Request review of equipment safety boundary.', status: 'open', created_date: '2026-07-12T09:00:00.000Z' }
    ],
    GamificationLedger: [
      { id: 'ldgr-1', user_id: 'usr-operator', points: 100, reason: 'Course Completion', details: 'Completed LOTO training', created_date: '2026-07-10T12:00:00.000Z' }
    ],
    DigitalTwin: [],
    AutonomicLearningLoop: [],
    BiometricSession: [],
    CognitiveProfile: [],
    AIEmbeddedMentor: [],
    Discussion: [
      { id: 'disc-1', process_id: 'proc-loto', title: 'Isolating hydraulic pressure accumulator', description: 'Is it safe to isolate the secondary valves while pressure accumulator is charged?', is_resolved: true, is_urgent: false, created_by_id: 'usr-operator', created_date: '2026-07-11T10:00:00.000Z' }
    ],
    DiscussionReply: [
      { id: 'rep-1', discussion_id: 'disc-1', message: 'No. You must completely bleed off accumulator pressure first. Refer to ASME safety procedures.', helpful_votes: 12, created_by_id: 'usr-supervisor', created_date: '2026-07-11T11:30:00.000Z' }
    ],
    KnowledgeContribution: [
      { id: 'kc-1', process_id: 'proc-loto', step_id: 'step-2', title: 'Accidental accumulator bleed-off tips', description: 'Be careful to open bleed valves extremely slowly to avoid hydraulic fluid hammer.', is_verified: true, validation_score: 95, created_by_id: 'usr-operator', created_date: '2026-07-12T14:00:00.000Z' }
    ],
    KnowledgeGraph: [],
    UserTheme: [],
    APIKey: [],
    MobileSession: [],
    HardwareIntegration: [],
    SystemIntegration: [],
    ContentGeneration: [],
    CollaborativeSession: [],
    DynamicLearningPath: [],
    SkillLedger: [],
    OnboardingProgress: []
  };

  return seeds[entityName] || [];
};
