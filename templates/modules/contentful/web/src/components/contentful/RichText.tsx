import Image from 'next/image';
import Link from 'next/link';
import {
  documentToReactComponents,
  type Options,
} from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS, type Document } from '@contentful/rich-text-types';

interface RichTextProps {
  document: Document | null | undefined;
  className?: string;
}

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-semibold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    [MARKS.CODE]: (text) => (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{text}</code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="mt-8 mb-3 text-2xl font-bold">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mt-6 mb-2 text-xl font-semibold">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="mb-4 border-l-4 border-gray-300 pl-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-gray-200" />,

    // Rich text içine gömülü Contentful asset'leri.
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const file = (node.data?.target as any)?.fields?.file;
      if (!file?.url) return null;

      const url = file.url.startsWith('//') ? `https:${file.url}` : file.url;
      const { width, height } = file.details?.image ?? {};

      return (
        <figure className="my-6">
          <Image
            src={url}
            alt={
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((node.data?.target as any)?.fields?.title as string) ?? ''
            }
            width={width ?? 1200}
            height={height ?? 675}
            className="h-auto w-full rounded-lg"
          />
        </figure>
      );
    },

    [INLINES.HYPERLINK]: (node, children) => {
      const uri = (node.data as { uri: string }).uri;
      const isInternal = uri.startsWith('/');

      if (isInternal) {
        return (
          <Link href={uri} className="text-blue-600 underline hover:text-blue-700">
            {children}
          </Link>
        );
      }

      return (
        <a
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-700"
        >
          {children}
        </a>
      );
    },
  },
};

/**
 * Contentful Rich Text alanlarını render eder.
 *
 *   <RichText document={product.body} />
 *
 * Stilleri kendi tasarım sistemine göre `options` içinden değiştir.
 */
export default function RichText({ document, className }: RichTextProps) {
  if (!document) return null;

  return <div className={className}>{documentToReactComponents(document, options)}</div>;
}
