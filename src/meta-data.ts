import environment from '@environment';

interface ApplicationVersion {
  release: string;
  version: string;
}

function extractMetaData(): ApplicationVersion {
  return {
    release: `Boilerplate Server Node - ${environment.node_env} v${environment.application_version}`,
    version: environment.application_version
  };
}

export default extractMetaData();