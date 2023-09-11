# How to Deploy CPTrainBot on a Kubernetes Cluster

This guide will assist you in deploying the CPTrainBot application, which comprises two separate components: a Discord Bot and a Backend service, on a Kubernetes cluster.

## Prerequisites

Before you begin, make sure you have the following:

-   A Kubernetes cluster, either self-hosted or managed
-   `kubectl` installed and configured to interact with your cluster
-   The necessary secrets for your Discord bot

## Steps

1. **Create your secrets**: The Discord bot requires certain secrets to function properly. These secrets include `CLIENT_ID` and `TOKEN`. You can create these secrets in Kubernetes using the following command:

    ```
    kubectl create secret generic cptrainbot-discord-credentials --from-literal=client-id=<your-client-id> --from-literal=token=<your-token>
    ```

    Replace `<your-client-id>` and `<your-token>` with your actual client ID and token.

2. **Apply the combined Deployment File**: Use `kubectl apply` to create the deployments and services defined in your combined file. Run the following command:
    ```
    kubectl apply -f cptrainbot-all-deployments.yaml
    ```
3. **Verify the deployments**: After applying your deployment file, use `kubectl get deployments` to verify that your deployments are running as expected.

4. **Verify the services**: Use `kubectl get services` to verify that your services are running and accessible.

5. **Access your deployed Applications**: At this point, your Discord bot and backend should be running on your Kubernetes cluster. You can interact with them via Discord and any other interfaces you've defined.

## Customization

The deployment files come with some default values, but you can modify them according to your needs:

-   **Backend Port**: By default, the backend service runs on port 3000. You can change this by modifying the `SERVER_PORT` environment variable in the backend deployment and the corresponding port in the backend service.
-   **Replicas**: The number of replicas for each deployment is set by default (1 for the Discord bot and 2 for the backend). You can adjust these numbers based on your load requirements. However, please note that increasing the number of replicas for the Discord bot may not be beneficial as it doesn't support sharding at the moment.

## Note

If you want to deploy only the backend or only the Discord bot, you can refer to their respective deployment files in cptrainbot-discord-bot-deployment.yaml for the Discord bot and [backend repository.](https://github.com/zadoke/CPTrainBot-backend/tree/main/deployments) However, please note that the Discord bot cannot run without the backend.
