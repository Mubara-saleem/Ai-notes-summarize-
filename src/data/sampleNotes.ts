export interface SampleNoteItem {
  id: string;
  title: string;
  category: string;
  language: 'en' | 'ur';
  description: string;
  text: string;
}

export const SAMPLE_NOTES: SampleNoteItem[] = [
  {
    id: 'sample-bio-1',
    title: 'Cellular Respiration & Energy Metabolism',
    category: 'Biology',
    language: 'en',
    description: 'Detailed lecture notes on glycolysis, Krebs cycle, and electron transport chain.',
    text: `BIOLOGY 201: CELLULAR METABOLISM & BIOENERGETICS
Lecture 6: Cellular Respiration and ATP Synthesis

1. Overview:
Cellular respiration is the biochemical pathway through which cells convert biochemical energy from nutrients (primarily glucose) into adenosine triphosphate (ATP), releasing waste products like carbon dioxide and water. The catabolic process is divided into three distinct stages: Glycolysis, the Citric Acid Cycle (Krebs cycle), and Oxidative Phosphorylation.

2. Stage 1: Glycolysis (Cytoplasm)
- Occurs in the cytosol and does not require oxygen (anaerobic).
- One molecule of glucose (6 carbons) is broken down into two molecules of pyruvate (3 carbons).
- Energy investment phase uses 2 ATP molecules.
- Energy payoff phase generates 4 ATP molecules via substrate-level phosphorylation and 2 NADH molecules.
- Net yield: 2 ATP, 2 NADH, and 2 Pyruvate.

3. Intermediate Step: Pyruvate Oxidation (Mitochondrial Matrix)
- Pyruvate is transported into the mitochondrial matrix.
- Each pyruvate is decarboxylated (loses one CO2) and oxidized by NAD+ to form NADH.
- The remaining two-carbon acetyl group is bonded to Coenzyme A to form Acetyl-CoA.

4. Stage 2: The Citric Acid Cycle / Krebs Cycle (Mitochondrial Matrix)
- Acetyl-CoA combines with oxaloacetate (4-carbon molecule) to form citrate (6 carbons).
- Through a series of redox reactions, two molecules of CO2 are released per cycle.
- Per turn of the cycle (2 turns per glucose): Yields 3 NADH, 1 FADH2, 1 ATP (or GTP), and regenerates oxaloacetate.
- Total yield for one glucose molecule: 6 NADH, 2 FADH2, 2 ATP, 4 CO2.

5. Stage 3: Oxidative Phosphorylation (Inner Mitochondrial Membrane)
- Electron Transport Chain (ETC): Complex I through IV embed in the inner membrane cristae. Electrons from NADH and FADH2 pass down the chain, driving protons (H+) from the matrix into the intermembrane space, creating an electrochemical proton gradient (proton motive force).
- Oxygen acts as the final electron acceptor, combining with electrons and protons to form H2O. If oxygen is absent, the chain ceases and anaerobic fermentation takes over.
- Chemiosmosis: Protons flow down their concentration gradient back into the matrix through the enzyme ATP Synthase. The mechanical rotation of ATP synthase phosphorylates ADP into ATP.
- Theoretical ATP yield: Approximately 30 to 32 ATP per glucose molecule.

6. Key Regulatory Points:
- Phosphofructokinase (PFK) is the primary allosteric enzyme regulating glycolysis. It is inhibited by high levels of ATP and citrate, and activated by AMP.`,
  },
  {
    id: 'sample-cs-2',
    title: 'Operating Systems: Process Synchronization & Deadlocks',
    category: 'Computer Science',
    language: 'en',
    description: 'Core concepts in CPU scheduling, mutual exclusion, and Coffman deadlock conditions.',
    text: `CS 350: OPERATING SYSTEM PRINCIPLES
Module 4: Process Synchronization, Critical Sections, and Deadlock Management

1. The Critical-Section Problem:
A critical section is a segment of code where a process accesses shared resources, such as variables, memory tables, or files. When one process is executing in its critical section, no other process is allowed to execute in its own critical section.

A complete solution must satisfy three fundamental criteria:
1. Mutual Exclusion: If process Pi is executing in its critical section, then no other processes can be executing in their critical sections.
2. Progress: If no process is executing in its critical section and some processes wish to enter, only those processes that are not executing in their remainder sections can participate in deciding which will enter next.
3. Bounded Waiting: There exists a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter, preventing starvation.

2. Synchronization Mechanisms:
- Mutex Locks: A hardware-assisted boolean lock. A process must acquire the lock before entering and release it upon exiting. Provides binary mutual exclusion.
- Semaphores: An integer variable accessed only through two atomic operations: wait() (also known as P) and signal() (also known as V). Counting semaphores control access to a resource pool with finite instances.
- Monitors: A high-level synchronization construct that encapsulates data variables and operations, guaranteeing that only one process at a time can be active inside the monitor.

3. Deadlocks:
A deadlock is a situation where a set of processes are blocked because each process holds a resource and waits for another resource held by another process in the same set.

Coffman's Four Necessary Conditions for Deadlock:
1. Mutual Exclusion: At least one resource must be non-shareable.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly preempted from a process; they can only be released voluntarily by the holding process.
4. Circular Wait: A closed loop exists where Process P0 waits for P1, P1 waits for P2, and Pn waits for P0.

4. Handling Deadlocks:
- Deadlock Prevention: Invalidate at least one of the four necessary Coffman conditions (e.g., impose strict global resource ordering to eliminate circular wait).
- Deadlock Avoidance: Banker's Algorithm dynamically verifies that allocating a requested resource will leave the system in a 'safe state' before grant.
- Deadlock Detection and Recovery: Let deadlocks occur, detect cycles using a Wait-For Graph, and resolve by terminating processes or preempting resources.`,
  },
  {
    id: 'sample-psych-3',
    title: 'Cognitive Psychology: Memory Systems & Schema Theory',
    category: 'Psychology',
    language: 'en',
    description: 'Atkinson-Shiffrin multi-store model, working memory, and retrieval cues.',
    text: `PSYCHOLOGY 101: FOUNDATIONS OF COGNITIVE SCIENCE
Chapter 7: Human Memory Architecture and Information Processing

1. The Multi-Store Model of Memory (Atkinson & Shiffrin, 1968):
Human memory operates through three distinct structural components:
- Sensory Register: Stores incoming sensory stimuli for fractions of a second. Iconic memory holds visual stimuli (~500ms), while Echoic memory holds auditory stimuli (3-4 seconds). Information not attended to decays rapidly.
- Short-Term Memory (STM): Temporary working storage with a limited capacity traditionally estimated at 7 ± 2 items (Miller's Law) and duration of 15 to 30 seconds without rehearsal. Maintenance rehearsal keeps items in STM.
- Long-Term Memory (LTM): Theoretically infinite capacity and lifetime duration. Information is transferred via elaborative rehearsal and semantic encoding.

2. Baddeley and Hitch's Working Memory Model (1974):
Replaced the unitary STM model with an active multicomponent workspace:
- Central Executive: The attentional control system coordinating slave systems, focusing attention, and switching cognitive tasks.
- Phonological Loop: Handles verbal and acoustic information; consists of the phonological store ('inner ear') and articulatory rehearsal loop ('inner voice').
- Visuospatial Sketchpad: Manipulates visual imagery and spatial relationships ('inner eye').
- Episodic Buffer (added 2000): Integrates information across visual, spatial, and verbal modalities with chronological sequencing and links directly into LTM.

3. Long-Term Memory Subsystems:
- Declarative (Explicit) Memory: Conscious recollection of factual information. Divided into Episodic Memory (personal biographical life events) and Semantic Memory (general knowledge, facts, language concepts). Mediated by the hippocampus and temporal lobes.
- Non-Declarative (Implicit) Memory: Unconscious behavioral influences. Includes Procedural Memory (motor skills like cycling) and Classical Conditioning. Mediated by the cerebellum and basal ganglia.

4. Forgetting and Retrieval Failure:
- Interference Theory: Proactive interference occurs when older memories disrupt recall of new information; Retroactive interference occurs when newly learned material disrupts recall of previously stored memories.
- Cue-Dependent Forgetting: Encoding Specificity Principle states that memory retrieval is maximized when cognitive, environmental, or physiological cues match the original encoding context.`,
  },
  {
    id: 'sample-urdu-4',
    title: 'ماحولیاتی سائنس: ماحولیاتی آلودگی اور حیاتیاتی تنوع',
    category: 'Environmental Science',
    language: 'ur',
    description: 'ماحولیاتی تبدیلی، گرین ہاؤس گیسز اور ماحولیاتی توازن پر جامع تعلیمی نوٹس۔',
    text: `ماحولیاتی سائنس: لیکچر 4
موضوع: ماحولیاتی آلودگی، گلوبل وارمنگ اور حیاتیاتی تنوع کا تحفظ

1. تعارف:
ماحولیاتی آلودگی سے مراد قدرتی ماحول میں ایسے نقصان دہ مادوں کا شامل ہونا ہے جو انسانوں، نباتات اور حیوانات کی بقا کے لیے خطرہ پیدا کرتے ہیں۔ کرہ ارض پر انسانی سرگرمیوں، کارخانوں اور گاڑیوں کے دھویں کی وجہ سے ماحولیاتی نظام (Ecosystem) شدید عدم توازن کا شکار ہو چکا ہے۔

2. آلودگی کی بنیادی اقسام:
- فضائی آلودگی (Air Pollution): کاربن ڈائی آکسائیڈ، نائٹروجن آکسائیڈ اور سلفر ڈائی آکسائیڈ گیسوں کے اخراج سے فضا زہریلی ہوتی ہے جس سے سموگ (Smog) اور تیزابی بارش (Acid Rain) جنم لیتی ہے۔
- آبی آلودگی (Water Pollution): صنعتی فضلہ اور زرعی کیمیکلز ندی نالوں اور دریاؤں میں شامل ہو کر سمندری حیات اور پینے کے صاف پانی کو تباہ کرتے ہیں۔
- زمینی آلودگی (Soil Pollution): غیر نامیاتی کچرا اور پلاسٹک زمین کی زرخیزی کو کم کر رہے ہیں، جس سے خوراک کے پیداواری نظام کو نقصان پہنچ رہا ہے۔

3. گرین ہاؤس اثر اور موسمیاتی تبدیلی (Greenhouse Effect & Climate Change):
گرین ہاؤس گیسز (جیسے کاربن ڈائی آکسائیڈ اور میتھین) سورج کی حرارت کو فضا میں قید کر لیتی ہیں۔ اس عمل کی زیادتی کے نتیجے میں اوسط عالمی درجہ حرارت میں مسلسل اضافہ ہو رہا ہے، جسے گلوبل وارمنگ کہتے ہیں۔ اس کے اثرات میں گلیشیئرز کا پگھلنا، سمندر کی سطح میں اضافہ اور شدید خشک سالی یا غیر معمولی سیلاب شامل ہیں۔

4. حیاتیاتی تنوع (Biodiversity) کی اہمیت:
حیاتیاتی تنوع سے مراد زمین پر پائے جانے والے جانداروں، پودوں اور جرثوموں کا تنوع ہے۔ یہ تنوع ماحولیاتی استحکام کے لیے ریڑھ کی ہڈی کی حیثیت رکھتا ہے۔ جنگلات کی کٹائی (Deforestation) اور قدرتی مسکنوں کی تباہی سے ہزاروں جاندار معدومی کے خطرے سے دوچار ہو چکے ہیں۔

5. تدارک اور پائیدار حل:
- قابل تجدید توانائی (Renewable Energy) جیسے شمسی اور ہوائی توانائی کا فروغ۔
- شجرکاری مہمات اور جنگلات کے کٹاؤ پر پابندی۔
- تین اصولوں پر عمل: ریڈیوس (Reduce)، ری یوز (Reuse)، اور ری سائیکل (Recycle)۔`,
  },
];
