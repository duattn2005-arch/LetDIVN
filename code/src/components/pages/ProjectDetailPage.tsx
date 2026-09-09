import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { ProjectStaticContent } from '../ProjectStaticContent';
import { CleanupEvent } from '../../types';
import { slugify } from '../../utils/slug';

interface ProjectDetailPageProps {
  projectId: string;
}

// The static per-category campaign story only — no schedule/map/registration
// content here anymore, since that now lives on its own dedicated page
// (CampaignDetailPage, reached via /explore-campaigns/<slug>).
export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
}) => {
  const [events, setEvents] = useState<CleanupEvent[]>([]);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const event =
    events.find((e) => e.id === projectId) ||
    events.find((e) => e.category === projectId) ||
    events.find((e) => slugify(e.category) === projectId) ||
    events.find((e) => slugify(e.city) === projectId) ||
    events[0];

  if (!event) return null;

  return (
    <div className="bg-white">
      <ProjectStaticContent category={event.category} />
    </div>
  );
};
