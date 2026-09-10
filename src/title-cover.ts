import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import config from './config';

type TitleCoverOptions = {
  title: string;
  label?: string;
  accent?: string;
  date?: string;
  path: string;
};

const width = 1600;
const height = 1000;
const require = createRequire(import.meta.url);
const fontPath = require.resolve('@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff');
const fontData = readFile(fontPath);

function titleFontSize(title: string) {
  const units = Array.from(title).reduce((total, character) => total + (character.charCodeAt(0) > 255 ? 1 : 0.55), 0);
  return Math.min(112, Math.max(58, Math.floor((1376 * 2.75) / units)));
}

export async function renderTitleCover({
  title,
  label = `${config.site.shortName} / WEBSITE`,
  accent = '#1479f5',
  date = '',
  path,
}: TitleCoverOptions) {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#eef4ff',
          backgroundImage:
            'linear-gradient(rgba(219, 226, 237, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(219, 226, 237, 0.35) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          color: '#101828',
          fontFamily: 'Noto Sans SC',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%',
                padding: '94px 112px 88px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: accent,
                      fontSize: 30,
                      fontWeight: 700,
                    },
                    children: [
                      { type: 'span', props: { children: label } },
                      { type: 'span', props: { style: { color: '#526176' }, children: date } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      width: 1376,
                      color: '#101828',
                      fontSize: titleFontSize(title),
                      fontWeight: 700,
                      lineHeight: 1.18,
                      lineClamp: 3,
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-all',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#526176',
                      fontSize: 27,
                      fontWeight: 700,
                    },
                    children: [
                      { type: 'span', props: { children: new URL(config.site.url).hostname.toUpperCase() } },
                      { type: 'span', props: { children: path.toUpperCase() } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width,
      height,
      fonts: [
        {
          name: 'Noto Sans SC',
          data: await fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );

  const image = await sharp(Buffer.from(svg)).webp({ quality: 88 }).toBuffer();

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
