import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar';
import { FileText } from 'lucide-react';
import type React from 'react';

import type { ISearchGroupConfig, ISearchItem } from '../types';
import { initials } from './format';

/** Leading media of a hit: avatar (people), image tile or group icon. */
export const SearchResultMedia: React.FC<{ item: ISearchItem; group?: ISearchGroupConfig }> = ({
  item,
  group,
}) => {
  const Icon = group?.icon ?? FileText;

  if (group?.roundImage) {
    return (
      <Avatar className="size-10">
        {item.imageUrl && <AvatarImage src={item.imageUrl} alt="" className="object-cover" />}
        <AvatarFallback className="text-caption font-bold">
          {initials(item.title) || <Icon className="size-4" />}
        </AvatarFallback>
      </Avatar>
    );
  }
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt=""
        loading="lazy"
        className="size-10 shrink-0 rounded-lg border border-border/50 object-cover"
      />
    );
  }
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
      <Icon className="size-4" />
    </span>
  );
};
