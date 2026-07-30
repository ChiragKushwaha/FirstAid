import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import protocolsData from '@/data/protocols.json';
import ProtocolDetailView, { type Protocol } from '@/components/ProtocolDetailView';

const protocols: Protocol[] = protocolsData as Protocol[];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return protocols.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const protocol = protocols.find((p) => p.id === id);

  if (!protocol) {
    return {
      title: 'Protocol Not Found',
    };
  }

  return {
    title: `${protocol.title} Emergency Protocol`,
    description: `${protocol.summary} Step-by-step emergency first aid instructions for ${protocol.category.toLowerCase()} emergency response.`,
    alternates: {
      canonical: `/protocols/${id}`,
    },
    openGraph: {
      title: `${protocol.title} — Emergency First Aid Guide`,
      description: protocol.summary,
      url: `https://fieldaid.app/protocols/${id}`,
      type: 'article',
      siteName: 'FieldAid Emergency Response',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${protocol.title} Emergency Guide`,
      description: protocol.summary,
    },
  };
}

export default async function ProtocolPage({ params }: PageProps) {
  const { id } = await params;
  const protocol = protocols.find((p) => p.id === id);

  if (!protocol) {
    notFound();
  }

  const procedureJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: protocol.title,
    description: protocol.summary,
    procedureType: 'EmergencyProcedure',
    bodyLocation: protocol.category,
    howToStep: protocol.steps.map((step) => ({
      '@type': 'HowToStep',
      position: step.step,
      text: step.instruction,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://fieldaid.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Protocols',
        item: 'https://fieldaid.app/protocols',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: protocol.title,
        item: `https://fieldaid.app/protocols/${protocol.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProtocolDetailView protocol={protocol} />
    </>
  );
}
