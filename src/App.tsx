import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { cn } from "./lib/utils";

const iosBuildNumberRegex = /buildNumber from \d+ to (\d+)/;
const androidApkUrlRegex = /(https:\/\/expo\.dev\/artifacts\/eas\/[^\s]+\.apk)/;
const androidIdRegex =
  /See 🤖 Android logs: https:\/\/expo\.dev\/accounts\/[^/]+\/projects\/[^/]+\/builds\/([a-f0-9-]+)/;

const iosIdRegex =
  /See 🍏 iOS logs: https:\/\/expo\.dev\/accounts\/[^/]+\/projects\/[^/]+\/builds\/([a-f0-9-]+)/;

const qaInfoTemplate = `
TestFlight (ios) version: 1.0.0
TestFlight (ios) version code: {{versionCode}}

Android APK URL - {{androidApkUrl}}

Browserstack info:
android id - {{androidId}}
ios id - {{iosId}}
`;

const extractData = (buildOutput: string) => {
  const iosBuildNumber = buildOutput.match(iosBuildNumberRegex)?.[1];
  const androidApkUrl = buildOutput.match(androidApkUrlRegex)?.[0];
  const androidId = buildOutput.match(androidIdRegex)?.[1];
  const iosId = buildOutput.match(iosIdRegex)?.[1];

  return { iosBuildNumber, androidApkUrl, androidId, iosId };
};

const buildOutputToQAInfo = (buildOutput: string) => {
  const data = extractData(buildOutput);

  const errors = [];
  if (!data.iosBuildNumber) {
    errors.push("iosBuildNumber is not found");
  }
  if (!data.androidApkUrl) {
    errors.push("androidApkUrl is not found");
  }
  if (!data.androidId) {
    errors.push("androidId is not found");
  }
  if (!data.iosId) {
    errors.push("iosId is not found");
  }

  if (errors.length > 0) {
    return {
      errors,
      qaInfo: null,
    };
  }

  const qaInfo = qaInfoTemplate
    .replace("{{versionCode}}", data.iosBuildNumber ?? "")
    .replace("{{androidApkUrl}}", data.androidApkUrl ?? "")
    .replace("{{androidId}}", data.androidId ?? "")
    .replace("{{iosId}}", data.iosId ?? "");

  return {
    errors: [],
    qaInfo,
  };
};

function App() {
  const [buildOutput, setBuildOutput] = useState("");

  const { errors, qaInfo } = useMemo(
    () =>
      buildOutput.trim().length > 0
        ? buildOutputToQAInfo(buildOutput)
        : { errors: [], qaInfo: null },
    [buildOutput]
  );

  return (
    <div className="h-screen w-screen p-32 bg-indigo-400">
      <div className="grid grid-cols-2 gap-4 h-full">
        <Textarea
          className="h-full"
          placeholder="Paste build output here..."
          value={buildOutput}
          onChange={(e) => setBuildOutput(e.target.value)}
        />
        <Textarea
          className={cn("h-full", errors.length > 0 && "text-red-500")}
          placeholder="QA info will be here..."
          value={errors.length > 0 ? errors.join("\n") : qaInfo ?? ""}
        />
      </div>
    </div>
  );
}

export default App;
