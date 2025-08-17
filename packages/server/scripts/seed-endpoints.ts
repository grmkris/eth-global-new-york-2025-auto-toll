#!/usr/bin/env bun
import { nanoid } from 'nanoid';
import { db } from '../src/db';
import { type Endpoint, endpoints } from '../src/db/schema';
import { env } from '../src/env';

async function seedEndpoints() {
  console.log('🌱 Seeding test endpoints...');

  // Check for API keys
  const elevenLabsKey = env.ELEVENLABS_API_KEY;
  const replicateToken = env.REPLICATE_API_TOKEN;

  if (!elevenLabsKey) {
    console.log('⚠️  No ELEVENLABS_API_KEY in env, using default');
  }
  if (!env.REPLICATE_API_TOKEN) {
    console.log(
      '⚠️  No REPLICATE_API_TOKEN in env, Replicate endpoints will not work'
    );
  }

  const testEndpoints: Endpoint[] = [
    {
      id: nanoid(10),
      name: 'Chuck Norris Jokes',
      targetUrl: 'https://api.chucknorris.io/jokes/random',
      authType: 'none',
      authKey: null,
      authValue: null,
      requiresPayment: true,
      price: '$0.0011',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      createdAt: new Date(),
      metadata: {
        description: 'Get a random Chuck Norris joke',
        usage: {
          method: 'GET',
          path: '', // No additional path needed, targetUrl is complete
          response: {
            format: 'json',
            example: {
              icon_url: 'https://api.chucknorris.io/img/avatar/chuck-norris.png',
              id: 'random_id',
              url: 'https://api.chucknorris.io/jokes/random_id',
              value: 'Chuck Norris can divide by zero.',
            },
          },
        },
        aiExample: {
          description: 'To get a Chuck Norris joke, make a GET request',
          mcp: 'mcp__x402-marketplace__call_api with apiId and method="GET"',
        },
      } as const,
    },
    {
      id: nanoid(10),
      name: 'Cat Facts',
      targetUrl: 'https://catfact.ninja/fact',
      authType: 'none',
      authKey: null,
      authValue: null,
      requiresPayment: true,
      createdAt: new Date(),
      price: '$0.0012',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      metadata: {
        description: 'Get a random fact about cats',
        usage: {
          method: 'GET',
          path: '', // No additional path needed
          response: {
            format: 'json',
            example: {
              fact: 'Cats have 32 muscles in each ear.',
              length: 34,
            },
          },
        },
        aiExample: {
          description: 'To get a cat fact, make a GET request',
          mcp: 'mcp__x402-marketplace__call_api with apiId and method="GET"',
        },
      } as const,
    },
    // ElevenLabs TTS Endpoints - Different voices
    {
      id: nanoid(10),
      name: 'ElevenLabs TTS',
      targetUrl: 'https://api.elevenlabs.io/v1', // Base URL
      authType: 'header',
      authKey: 'xi-api-key',
      authValue: elevenLabsKey,
      requiresPayment: true,
      createdAt: new Date(),
      price: '$0.014',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      metadata: {
        description: 'Convert text to speech with various voices',
        voices: [
          { id: 'NOpBlnGInO9m6vDvFkFC', name: 'Grandpa spuds' },
          { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
          { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian' },
          { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'Default Voice' },
        ],
        usage: {
          method: 'POST',
          path: '/text-to-speech/{voice_id}', // Append to base URL
          queryParams: {
            output_format: 'mp3_44100_128', // Options: mp3_44100_128, mp3_22050_32, etc.
          },
          body: {
            text: 'Your text to convert to speech',
            model_id: 'eleven_multilingual_v2', // or eleven_monolingual_v1
          },
          response: {
            format: 'audio/mpeg',
            description: 'Returns MP3 audio binary data',
          },
        },
        aiExample: {
          description: 'To generate speech, use POST with voice ID in path',
          mcp: 'mcp__x402-marketplace__call_api with apiId, method="POST", path="/text-to-speech/21m00Tcm4TlvDq8ikWAM", params={"output_format": "mp3_44100_128"}, body={"text": "Hello world", "model_id": "eleven_multilingual_v2"}',
        },
      } as const,
    },
    {
      id: nanoid(10),
      name: 'ElevenLabs Sound Effects',
      targetUrl: 'https://api.elevenlabs.io/v1', // Base URL - path will be appended
      authType: 'header',
      authKey: 'xi-api-key',
      authValue: elevenLabsKey,
      requiresPayment: true,
      createdAt: new Date(),
      price: '$0.015',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      metadata: {
        description: 'Generate sound effects from text descriptions',
        usage: {
          method: 'POST',
          path: '/sound-generation', // This path is appended to the base URL
          queryParams: {
            output_format: 'mp3_44100_128', // Optional: mp3_44100_128, mp3_22050_32, etc.
          },
          body: {
            text: 'Description of the sound effect you want',
            duration_seconds: null, // Optional: 0.5 to 22 seconds, null for auto
            prompt_influence: 0.3, // Optional: 0 to 1, higher = more prompt adherence
          },
          response: {
            format: 'audio/mpeg',
            description: 'Returns MP3 audio binary data of the generated sound effect',
          },
        },
        examples: [
          { text: 'Laser gun blast with echo, sci-fi weapon' },
          { text: 'Thunder rumble with rain, distant storm' },
          { text: 'Spacious braam suitable for high-impact movie trailer moments' },
          { text: 'Magical spell casting sound with sparkles' },
        ],
        aiExample: {
          description: 'To generate sound effects, use POST to /sound-generation',
          mcp: 'mcp__x402-marketplace__call_api with apiId, method="POST", path="/sound-generation", body={"text": "laser gun blast", "duration_seconds": 2.5}',
        },
      } as const,
    },
    // Replicate AI Models
    {
      id: nanoid(10),
      name: 'Replicate',
      targetUrl: 'https://api.replicate.com/v1',
      authType: 'bearer',
      authKey: null,
      authValue: replicateToken,
      requiresPayment: true,
      createdAt: new Date(),
      price: '$0.003',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      metadata: {
        description: 'Replicate AI model API - supports image generation, video generation, and more',
        usage: {
          createPrediction: {
            description: 'Create a new prediction (image/video generation)',
            method: 'POST',
            path: '/models/{owner}/{model}/predictions',
            example: '/models/ideogram-ai/ideogram-v2a-turbo/predictions',
          },
          checkStatus: {
            description: 'Check prediction status (poll until complete)',
            method: 'GET',
            path: '/predictions/{prediction_id}',
            example: '/predictions/c9gsqmxzb5rmc0crpyntf64pdm',
          },
        },
        examples: {
          ideogramV2ATurbo: {
            name: 'Ideogram V2A Turbo (Image Generation)',
            createPrediction: {
              method: 'POST',
              path: '/models/ideogram-ai/ideogram-v2a-turbo/predictions',
              body: {
                input: {
                  prompt: 'Vector art of a friendly robot with speech bubbles',
                  resolution: 'None',
                  style_type: 'None',
                  aspect_ratio: '3:2',
                  magic_prompt_option: 'Auto',
                },
              },
            },
            checkStatus: {
              method: 'GET',
              path: '/predictions/{prediction_id}',
              description: 'Poll this endpoint until status is "succeeded"',
              responseExample: {
                id: 'prediction_id',
                status: 'succeeded',
                output: ['https://replicate.delivery/pbxt/...generated-image.png'],
              },
            },
          },
          fluxSchnell: {
            name: 'Flux Schnell (Fast Image Generation)',
            createPrediction: {
              method: 'POST',
              path: '/models/black-forest-labs/flux-schnell/predictions',
              body: {
                input: {
                  prompt: 'A beautiful sunset over mountains',
                  aspect_ratio: '16:9',
                  output_format: 'png',
                  output_quality: 90,
                },
              },
            },
          },
          sdxlLightning: {
            name: 'SDXL Lightning (Ultra-fast Image Generation)',
            createPrediction: {
              method: 'POST',
              path: '/models/bytedance/sdxl-lightning-4step/predictions',
              body: {
                input: {
                  prompt: 'A cyberpunk city at night, neon lights',
                  width: 1024,
                  height: 1024,
                  num_inference_steps: 4,
                },
              },
            },
          },
          videoGeneration: {
            name: 'Video Generation',
            createPrediction: {
              method: 'POST',
              path: '/models/wan-video/wan-2.2-t2v-fast/predictions',
              body: {
                input: {
                  prompt: 'A sports car driving along a beach at sunset',
                  go_fast: true,
                  num_frames: 81,
                  resolution: '480p',
                  aspect_ratio: '16:9',
                  frames_per_second: 16,
                },
              },
            },
          },
        },
        aiWorkflow: {
          description: 'Replicate uses async processing. Follow this workflow:',
          steps: [
            '1. Create prediction: POST to /models/{owner}/{model}/predictions',
            '2. Get prediction ID from response',
            '3. Poll status: GET /predictions/{prediction_id}',
            '4. Check status field: "starting" → "processing" → "succeeded"',
            '5. Get result from output field when status is "succeeded"',
          ],
          example: {
            step1: 'mcp__x402-marketplace__call_api with apiId, method="POST", path="/models/black-forest-labs/flux-schnell/predictions", body={"input": {...}}',
            step2: 'Extract prediction.id from response',
            step3: 'mcp__x402-marketplace__call_api with apiId, method="GET", path="/predictions/{id}"',
            step4: 'Check response.status, if "succeeded" get response.output[0] for image URL',
          },
        },
        tips: [
          'Always use the proxy path format: /paid-proxy/{endpoint_id}/{model_path}',
          'For creating predictions: POST to /models/{owner}/{model}/predictions',
          'For checking status: GET /predictions/{prediction_id}',
          'Poll status endpoint until status becomes "succeeded" or "failed"',
          'The output field will contain URLs to generated images/videos when complete',
          'Sound generation models: meta/musicgen, riffusion/riffusion',
          'For sound effects, consider using ElevenLabs Sound Effects API instead',
        ],
      } as const,
    },
  ];

  // Clear existing endpoints first (optional)
  console.log('🧹 Clearing existing endpoints...');
  await db.delete(endpoints);

  // Insert all endpoints
  for (const endpoint of testEndpoints) {
    try {
      await db.insert(endpoints).values(endpoint);
      console.log(`✅ Registered: ${endpoint.name}`);
      console.log(`   ID: ${endpoint.id}`);
      console.log(
        `   Proxy URL: ${endpoint.requiresPayment ? `/paid-proxy/${endpoint.id}` : `/proxy/${endpoint.id}`}`
      );
      console.log(
        `   Payment: ${endpoint.requiresPayment ? `Required (${endpoint.price})` : 'Free'}`
      );
      if (endpoint.walletAddress) {
        console.log(`   Wallet: ${endpoint.walletAddress}`);
      }
    } catch (error) {
      console.error(`❌ Error registering ${endpoint.name}:`, error);
    }
  }

  // List all endpoints
  console.log('\n📋 All registered endpoints:');

  try {
    const allEndpoints = await db.query.endpoints.findMany();

    console.log(`\nFound ${allEndpoints.length} endpoints:`);
    for (const ep of allEndpoints) {
      console.log(`- ${ep.name} (${ep.id})`);
      console.log(
        `  URL: ${ep.requiresPayment ? `/paid-proxy/${ep.id}` : `/proxy/${ep.id}`}`
      );
      console.log(`  Payment: ${ep.requiresPayment ? ep.price : 'Free'}`);
      if (ep.walletAddress) {
        console.log(`  Wallet: ${ep.walletAddress}`);
      }
    }
  } catch (error) {
    console.error('Failed to list endpoints:', error);
  }

  console.log('\n✨ Seeding complete!');
  process.exit(0);
}

// Run seeding
seedEndpoints().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
