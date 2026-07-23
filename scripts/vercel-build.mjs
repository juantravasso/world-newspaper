import {
  spawnSync,
} from "node:child_process";

const isProduction =
  process.env.VERCEL_ENV ===
  "production";

assertEnvironmentVariables(
  isProduction
    ? [
        "DATABASE_URL",
        "DIRECT_URL",
        "CRON_SECRET",
      ]
    : [
        "DATABASE_URL",
      ],
);

console.log(
  `[production-build] Vercel environment: ${
    process.env.VERCEL_ENV ??
    "local"
  }`,
);

if (
  isProduction
) {
  console.log(
    "[production-build] Applying pending Prisma migrations.",
  );

  runYarn(
    [
      "db:deploy",
    ],
  );
} else {
  console.log(
    "[production-build] Skipping production migrations outside the production environment.",
  );
}

console.log(
  "[production-build] Generating Prisma Client and building Next.js.",
);

runYarn(
  [
    "build",
  ],
);

function assertEnvironmentVariables(
  variableNames,
) {
  const missingVariables =
    variableNames.filter(
      (variableName) =>
        !process.env[
          variableName
        ]
          ?.trim(),
    );

  if (
    missingVariables.length >
    0
  ) {
    console.error(
      [
        "[production-build] Missing environment variables:",
        missingVariables.join(
          ", ",
        ),
      ].join(
        " ",
      ),
    );

    process.exit(
      1,
    );
  }
}

function runYarn(
  argumentsList,
) {
  const yarnCommand =
    process.platform ===
    "win32"
      ? "yarn.cmd"
      : "yarn";

  const execution =
    spawnSync(
      yarnCommand,
      argumentsList,
      {
        stdio:
          "inherit",

        env:
          process.env,
      },
    );

  if (
    execution.error
  ) {
    throw execution.error;
  }

  if (
    execution.status !==
    0
  ) {
    process.exit(
      execution.status ??
      1,
    );
  }
}
