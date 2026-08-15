import type { Context } from "hono"
import { Badge } from "./types.js"

type RepoByDidResponse = {
  cid: string;
  uri: string;
  value: {
    $type: "sh.tangled.repo";
    createdAt: Date;
    description?: string;
    knot: string;
    labels: string[]
    repoDid: string;
    spindle?: string;
    website?: string;
  };
}

type QuerySpindlePipelineResponse = {
  cursor: string;
  pipelines: [{
    commit: string;
    createdAt: Date;
    id: string;
    repo: string;
    trigger: {
      // there are more trigger types but we probably don't care about those
      $type: "sh.tangled.ci.trigger#push" | "sh.tangled.ci.trigger#pullRequest";
      newSha: string;
      oldSha: string;
      ref: string;
    };
    workflows: [{
      finishedAt: Date;
      id: string;
      name: string;
      startedAt: Date;
      // 'timeout' can also mean failed as well maybe?
      status: "success" | "failed" | 'timeout'
    }]
  }] | null
}

const USER_AGENT = "cardd.cc";

async function getRepoByDid(did: string): Promise<RepoByDidResponse> {
  const response = await fetch(`https://bobbin.klbr.net/xrpc/sh.tangled.repo.getRepoByRepoDid?repoDid=${did}`, {
    headers: {
      'User-Agent': USER_AGENT
    }
  })
  if (!response.ok) {
    throw new Error(`Failed to get repo for ${did}: ${response.status}`)
  }

  return response.json();
}

async function querySpindlePipelines(spindle: string, repoDid: string): Promise<QuerySpindlePipelineResponse> {
  const response = await fetch(`https://${spindle}/xrpc/sh.tangled.ci.queryPipelines?repo=${repoDid}&limit=1`, {
    headers: {
      'User-Agent': USER_AGENT
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to query spindle pipeline: ${response.status}`)
  }

  return response.json()
}

export class TangledSpindleStatus extends Badge {
  id = "tangled-spindle-status";
  title = "Tangled Spindle Status";
  description = "CI status for a tangled spindle service";
  path = "/tg/spindle/status/:repoDid";
  examplePath = "/tg/spindle/status/did:plc:j5hmlfdrwkvtxm7cjmu7j2is";

  pathParams = [
    { name: "repoDid", description: "Tangled Repo DID" }
  ];

  demoPresets = [
    { label: "tangled.org/core", value: "did:plc:j5hmlfdrwkvtxm7cjmu7j2is" },
    { label: "aly.codes/snrld", value: "did:plc:5owm2kge6b5fzlizna5k6is4" },
    { label: "jola.dev/annot.at", value: "did:plc:e7p3zvl4clvkrywuwamonsxo" },
    { label: "tranquil.farm/tranquil-pds", value: "did:plc:jj6ajj6duxnlthwtnob4qyuv" }
  ];

  async fetch(c: Context) {
    const repoDid = c.req.param("repoDid");
    if (!repoDid) throw new Error("Repo DID not provided");

    const repo = await getRepoByDid(repoDid);
    if (!repo.value.spindle) {
      throw new Error(`No spindle configured for repo: ${repoDid}`)
    }

    const spindle = await querySpindlePipelines(repo.value.spindle, repoDid);
    if (spindle.pipelines === null) throw new Error(`Spindle has no runs yet`);

    const isSuccessfulRun = spindle.pipelines[0].workflows[0].status === 'success';

    return { label: "ci", value: isSuccessfulRun ? "passing" : "failing" }
  }

  onError(err: Error) {
    return { label: "ci", value: err.message }
  }
}
