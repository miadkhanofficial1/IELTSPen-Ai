export interface WritingTask {
  id: string;
  task_type: "task_1" | "task_2";
  topic_category: string;
  title: string;
  prompt_text: string;
  chart_data: any;
  model_answer: string;
  vocabulary_assets: Array<{ word: string; meaning: string; example: string }>;
  status: "draft" | "published";
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export const INITIAL_TASKS: WritingTask[] = [
  {
    id: "d4e5f6a1-0001-4000-8000-000000000001",
    task_type: "task_1",
    topic_category: "Renewable Energy",
    title: "Global Renewable Energy Generation (2015 - 2024)",
    prompt_text:
      "The bar chart illustrates the amount of electricity generated from three renewable sources—Solar, Wind, and Hydroelectric—globally between 2015 and 2024, measured in Terawatt-hours (TWh).\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    chart_data: {
      type: "bar",
      title: "Global Renewable Electricity Generation by Source (TWh)",
      xAxisKey: "year",
      series: [
        { key: "solar", label: "Solar Energy", color: "#F59E0B" },
        { key: "wind", label: "Wind Power", color: "#3B82F6" },
        { key: "hydro", label: "Hydroelectric", color: "#10B981" },
      ],
      data: [
        { year: "2015", solar: 260, wind: 830, hydro: 3880 },
        { year: "2018", solar: 580, wind: 1260, hydro: 4190 },
        { year: "2021", solar: 1040, wind: 1870, hydro: 4270 },
        { year: "2024", solar: 1680, wind: 2450, hydro: 4410 },
      ],
    },
    model_answer:
      "The bar chart compares the global generation of electricity from solar, wind, and hydroelectric power over a nine-year period from 2015 to 2024, measured in Terawatt-hours (TWh).\n\nOverall, it is evident that while hydroelectric power remained the dominant renewable source throughout the entire timeframe, solar energy experienced the most rapid and dramatic exponential growth, followed by substantial increases in wind power output.\n\nIn 2015, hydroelectric generation stood far ahead of all other alternatives at 3,880 TWh. By 2024, it climbed steadily to reach 4,410 TWh, retaining its position as the largest single contributor, albeit with modest growth relative to other renewables.\n\nIn stark contrast, solar electricity expanded more than sixfold over the decade. Starting at a modest 260 TWh in 2015, solar generation surged to 1,040 TWh by 2021 before reaching 1,680 TWh in 2024. Similarly, wind power nearly tripled from 830 TWh in 2015 to 2,450 TWh by the final year, firmly establishing itself as the second-highest renewable source.",
    vocabulary_assets: [
      {
        word: "exponential growth",
        meaning: "Growth whose rate becomes ever more rapid in proportion to the growing total number or size.",
        example: "Solar power generation experienced exponential growth over the measured decade.",
      },
      {
        word: "dominant contributor",
        meaning: "The primary or most significant component in a dataset.",
        example: "Hydroelectric energy remained the dominant contributor throughout the timeframe.",
      },
      {
        word: "in stark contrast",
        meaning: "Used to introduce an opposing or strikingly different fact or trend.",
        example: "In stark contrast to hydro's gradual rise, solar energy expanded more than sixfold.",
      },
      {
        word: "surge",
        meaning: "A sudden, powerful upward movement or increase.",
        example: "Production surged from 260 TWh to over 1,600 TWh by 2024.",
      },
    ],
    status: "published",
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "d4e5f6a1-0002-4000-8000-000000000002",
    task_type: "task_1",
    topic_category: "Education & Literacy",
    title: "Higher Education Enrollment Rates by Region (1990 - 2020)",
    prompt_text:
      "The line graph shows the percentage of young adults (aged 18–24) enrolled in tertiary education across three regions between 1990 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    chart_data: {
      type: "line",
      title: "Tertiary Education Enrollment (% of 18-24 population)",
      xAxisKey: "year",
      series: [
        { key: "northAmerica", label: "North America", color: "#E31837" },
        { key: "europe", label: "Europe", color: "#3B82F6" },
        { key: "asiaPacific", label: "Asia-Pacific", color: "#10B981" },
      ],
      data: [
        { year: "1990", northAmerica: 52, europe: 38, asiaPacific: 14 },
        { year: "2000", northAmerica: 61, europe: 49, asiaPacific: 23 },
        { year: "2010", northAmerica: 74, europe: 62, asiaPacific: 39 },
        { year: "2020", northAmerica: 82, europe: 71, asiaPacific: 54 },
      ],
    },
    model_answer:
      "The line chart illustrates tertiary education enrollment rates among 18-to-24-year-olds in North America, Europe, and Asia-Pacific over a 30-year span starting in 1990.\n\nOverall, tertiary education participation increased consistently across all three regions, with North America continually registering the highest proportions, while Asia-Pacific witnessed the steepest acceleration over the period.\n\nIn 1990, just over half (52%) of North American youth attended higher education institutions, followed by Europe at 38% and Asia-Pacific at only 14%. By 2010, figures in North America and Europe had risen steadily to 74% and 62% respectively.\n\nBy 2020, North American enrollment peaked at 82%, whereas Europe reached 71%. Most notably, the Asia-Pacific region witnessed an almost fourfold surge from 14% to 54%, substantially narrowing the historical gap with western regions by the end of the period.",
    vocabulary_assets: [
      {
        word: "tertiary education",
        meaning: "Post-secondary education, including college and university degrees.",
        example: "Enrollment in tertiary education escalated sharply across emerging economies.",
      },
      {
        word: "steepest acceleration",
        meaning: "The fastest rate of upward increase or progress.",
        example: "The Asia-Pacific region registered the steepest acceleration among all surveyed territories.",
      },
      {
        word: "narrow the historical gap",
        meaning: "To significantly reduce a long-standing disparity or difference.",
        example: "Rapid educational investments helped narrow the historical gap with Western nations.",
      },
    ],
    status: "published",
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "d4e5f6a1-0003-4000-8000-000000000003",
    task_type: "task_2",
    topic_category: "Technology & Artificial Intelligence",
    title: "AI in Education: Replacing Human Teachers",
    prompt_text:
      "Some people believe that advances in artificial intelligence will eventually enable automated tutoring systems to replace human teachers in schools and universities.\n\nTo what extent do you agree or disagree with this statement?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
    chart_data: null,
    model_answer:
      "With the rapid acceleration of artificial intelligence, an increasing debate has emerged over whether intelligent algorithms will eventually render human educators obsolete. While AI undoubtedly provides unparalleled personalization and analytical capabilities, I firmly disagree that it can fully replace human teachers, primarily because pedagogy fundamentally relies on emotional intelligence, mentorship, and ethical social development.\n\nOn one hand, AI systems excel at diagnostic precision and adaptive information delivery. Intelligent tutoring platforms can dynamically adjust pacing to an individual student's cognitive weaknesses, grading complex problem sets instantly and offering tailored remediation at scale. For quantitative disciplines like mathematics or programming syntax, such tools can optimize learning trajectories far more efficiently than an overburdened classroom teacher.\n\nHowever, true education transcends mere curriculum transmission. The paramount role of a teacher encompasses cultivating critical inquiry, fostering empathy, and instilling resilience during intellectual adversity. A generative algorithm cannot genuinely perceive student disillusionment, provide authentic moral encouragement, or model ethical citizenship through human vulnerability. Furthermore, classroom dynamics demand nuanced socio-emotional regulation, conflict mediation, and collaborative discourse—facets of holistic development that cannot be simulated through statistical neural predictions.\n\nIn conclusion, while artificial intelligence will undeniably transform into an indispensable pedagogical assistant, the nuanced psychological and moral dimensions of teaching necessitate an irreplaceable human core. The future of education lies in symbiosis rather than substitution.",
    vocabulary_assets: [
      {
        word: "render obsolete",
        meaning: "To make something no longer useful or needed because something newer and better exists.",
        example: "Technological advancements rarely render human teachers completely obsolete.",
      },
      {
        word: "pedagogical",
        meaning: "Relating to the methods and theory of teaching and education.",
        example: "AI acts as a potent pedagogical assistant rather than a full replacement.",
      },
      {
        word: "symbiosis",
        meaning: "A mutually beneficial relationship between different entities.",
        example: "The optimal future of education lies in the symbiosis between algorithms and human mentors.",
      },
      {
        word: "socio-emotional regulation",
        meaning: "The ability to manage and respond to emotional experiences within social environments.",
        example: "Teachers provide critical socio-emotional regulation that machines cannot replicate.",
      },
    ],
    status: "published",
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "d4e5f6a1-0004-4000-8000-000000000004",
    task_type: "task_2",
    topic_category: "Urban Planning & Environment",
    title: "Urban Congestion and Megacities: Problems & Solutions",
    prompt_text:
      "In many countries, major cities are experiencing severe overpopulation and infrastructural strain, leading to traffic gridlock, escalating housing costs, and environmental degradation.\n\nWhat are the primary causes of this phenomenon, and what sustainable solutions can governments implement to mitigate these issues?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
    chart_data: null,
    model_answer:
      "In the modern era, runaway urbanisation has precipitated unprecedented logistical crises in major metropolises across the globe. Acute congestion, skyrocketing property prices, and deteriorating air quality have become defining urban afflictions. This essay examines the central catalysts behind this trend—principally uneven economic decentralisation—and proposes actionable government interventions.\n\nThe fundamental cause of urban overpopulation is the disproportionate centralisation of premier employment opportunities, healthcare infrastructure, and elite tertiary academies in capital regions. Rural and secondary townships frequently suffer from infrastructural starvation, compelling ambitious citizens to migrate into overcrowded commercial cores in pursuit of socioeconomic mobility. Consequently, urban housing capacity and road transport grids are stretched past their sustainable thresholds.\n\nTo reverse this unsustainable trajectory, authorities must enact comprehensive regional diversification strategies. First, governments should provide substantial fiscal incentives—such as tax holidays and subsidized commercial leases—to multinational corporations that relocate satellite headquarters into regional hubs. Second, establishing high-speed regional rail corridors connects peri-urban zones to industrial centers, enabling citizens to commute rapidly without overburdening inner-city housing markets. Finally, investing in public transit decarbonization drastically curtail vehicular emissions.\n\nIn conclusion, overpopulated cities stem from centralized capital concentration. By implementing strategic economic decentralization and transit electrification, governments can restore regional balance and foster sustainable urban living.",
    vocabulary_assets: [
      {
        word: "runaway urbanisation",
        meaning: "Rapid, uncontrolled migration and growth of populations into urban centers.",
        example: "Runaway urbanisation has strained basic municipal infrastructure worldwide.",
      },
      {
        word: "catalyst",
        meaning: "An event or person that causes a great change or creates a chain reaction.",
        example: "Economic concentration acts as the primary catalyst behind severe rural-urban migration.",
      },
      {
        word: "socioeconomic mobility",
        meaning: "The movement of individuals or families over time from one socioeconomic stratum to another.",
        example: "Youth flock to megacities primarily in search of upward socioeconomic mobility.",
      },
      {
        word: "decentralisation",
        meaning: "The transfer of control or distribution of power/resources away from a central hub.",
        example: "Strategic economic decentralisation is the most durable remedy for urban congestion.",
      },
    ],
    status: "published",
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];
