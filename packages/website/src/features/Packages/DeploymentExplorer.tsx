import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import pako from 'pako';
import { Box, Spinner, Container } from '@chakra-ui/react';
import 'prismjs';
import 'prismjs/components/prism-toml';
import { CodePreview } from '@/components/CodePreview';
import { isEmpty } from 'lodash';
import { IpfsUrl } from './IpfsUrl';

export const DeploymentExplorer: FC<{
  variant: any;
}> = ({ variant }) => {
  const [loading, setLoading] = useState(false);
  const [deploymentData, setDeploymentData] = useState<any>({});

  useEffect(() => {
    setLoading(true);

    const controller = new AbortController();
    if (variant?.deploy_url) {
      axios
        .get(
          `https://ipfs.io/ipfs/${variant?.deploy_url?.replace('ipfs://', '')}`,
          { responseType: 'arraybuffer', signal: controller.signal }
        )
        .then((response) => {
          const uint8Array = new Uint8Array(response.data);
          const inflated = pako.inflate(uint8Array);
          const raw = new TextDecoder().decode(inflated);
          setDeploymentData(JSON.parse(raw));
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    return () => {
      controller.abort();
    };
  }, [variant]);

  return variant?.deploy_url ? (
    <Box>
      {variant?.deploy_url && (
        <IpfsUrl title="Deployment Data " url={variant.deploy_url} />
      )}

      {loading ? (
        <Box py="20" textAlign="center">
          <Spinner />
        </Box>
      ) : !isEmpty(deploymentData) ? (
        <Container maxW="container.lg">
          <CodePreview
            code={JSON.stringify(deploymentData, null, 2)}
            language="json"
          />
        </Container>
      ) : (
        <Box textAlign="center" py="20" opacity="0.5">
          Unable to retrieve deployment data
        </Box>
      )}
    </Box>
  ) : (
    <Box textAlign="center" py="20" opacity="0.5">
      No metadata is associated with this package
    </Box>
  );
};