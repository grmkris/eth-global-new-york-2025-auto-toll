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
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206', // Free API, no wallet needed
      createdAt: new Date(),
      metadata: {
        example: 'https://api.chucknorris.io/jokes/random',
      },
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
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206', // Example wallet 1
      metadata: {
        example: 'https://catfact.ninja/fact',
      },
    },
    // ElevenLabs TTS Endpoints - Different voices
    {
      id: nanoid(10),
      name: 'ElevenLabs TTS ',
      targetUrl: 'https://api.elevenlabs.io/v1/text-to-speech',
      authType: 'header',
      authKey: 'xi-api-key',
      authValue: elevenLabsKey,
      requiresPayment: true, // Free for testing
      createdAt: new Date(),
      price: '$0.014',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      metadata: {
        voices: [
          {
            id: 'NOpBlnGInO9m6vDvFkFC',
            name: 'Grandpa spuds',
          },
          {
            id: '21m00Tcm4TlvDq8ikWAM',
            name: 'Rachel',
          },
          {
            id: 'nPczCjzI2devNBz1zQrb',
            name: 'Brian',
          },
        ],
        exampleCurl: `curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128" \
     -H "xi-api-key: xi-api-key" \
     -H "Content-Type: application/json" \
     -d '{
  "text": "The first move is what sets everything in motion.",
  "model_id": "eleven_multilingual_v2"
}'`,
      } as const,
      // ElevenLab Sound Effects
    },
    {
      id: nanoid(10),
      name: 'ElevenLabs Sound Effects',
      targetUrl: 'https://api.elevenlabs.io/v1/sound-effects',
      authType: 'header',
      authKey: 'xi-api-key',
      authValue: elevenLabsKey,
      requiresPayment: true, // Free for testing
      createdAt: new Date(),
      price: '$0.015',
      walletAddress: '0x81d786b35f3EA2F39Aa17cb18d9772E4EcD97206',
      metadata: {
        exampleCurl: `curl -X POST https://api.elevenlabs.io/v1/sound-generation \
     -H "xi-api-key: xi-api-key" \
     -H "Content-Type: application/json" \
     -d '{
  "text": "Spacious braam suitable for high-impact movie trailer moments"
}'`,
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
        tips: [
          'Always use the proxy path format: /paid-proxy/{endpoint_id}/{model_path}',
          'For creating predictions: POST to /models/{owner}/{model}/predictions',
          'For checking status: GET /predictions/{prediction_id}',
          'Poll status endpoint until status becomes "succeeded" or "failed"',
          'The output field will contain URLs to generated images/videos when complete',
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
