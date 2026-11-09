import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar';
import { Badge } from '@ui/shad-cn/components/badge';
import { Button } from '@ui/shad-cn/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ui/shad-cn/components/card';
import { Checkbox } from '@ui/shad-cn/components/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@ui/shad-cn/components/field';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@ui/shad-cn/components/empty';
import { Input } from '@ui/shad-cn/components/input';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@ui/shad-cn/components/item';
import { Label } from '@ui/shad-cn/components/label';
import { Progress } from '@ui/shad-cn/components/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/shad-cn/components/select';
import { Separator } from '@ui/shad-cn/components/separator';
import { Skeleton } from '@ui/shad-cn/components/skeleton';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { Switch } from '@ui/shad-cn/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs';
import { Textarea } from '@ui/shad-cn/components/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui/shad-cn/components/accordion';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@ui/shad-cn/components/button-group';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover';
import { Slider } from '@ui/shad-cn/components/slider';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/shad-cn/components/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@ui/shad-cn/components/dropdown-menu';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@ui/shad-cn/components/carousel';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@ui/shad-cn/components/table';
import { AnimatedCalendarStandalone as Calendar } from '@ui/shad-cn/components/calender';
import { DatePicker } from '@ui/components/DatePicker';
import { ConfirmPopoverButton } from '@ui/components/ConfirmPopoverButton';
import { PluginPageLayout } from '@ui/components/PluginPageLayout';
import { PluginBarChart } from '@ui/components/PluginBarChart';
import { PluginAreaChart, PluginLineChart, PluginPieChart } from '@ui/components/PluginCharts';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@ui/shad-cn/components/drawer';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/shad-cn/components/dialog';

import { PluginColorPicker, PluginDateTimePicker, PluginEmojiPicker, PluginHtmlEditor } from './plugin.editor';
import type { IPluginUi } from './plugin.types';

/**
 * Bausteine, die Plugins über `api.ui` bekommen. Die Props sind im Vertrag (`IPluginUi`) schmal beschrieben;
 * die Host-Komponenten nehmen genau diese Props an. Namen und Props müssen zur SDK passen.
 */
export const pluginUi = {
  Alert, AlertTitle, AlertDescription,
  Avatar, AvatarImage, AvatarFallback,
  Badge,
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Checkbox,
  Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent,
  Input,
  Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions,
  Label,
  Progress,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Textarea,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator,
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
  Calendar, DatePicker,
  HtmlEditor: PluginHtmlEditor, ColorPicker: PluginColorPicker, EmojiPicker: PluginEmojiPicker, DateTimePicker: PluginDateTimePicker,
  Field, FieldSet, FieldLegend, FieldGroup, FieldContent, FieldLabel, FieldTitle, FieldDescription, FieldSeparator, FieldError,
  ToggleGroup, ToggleGroupItem,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  ButtonGroup, ButtonGroupSeparator, ButtonGroupText,
  Slider,
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent,
  Popover, PopoverTrigger, PopoverContent, PopoverAnchor,
  ConfirmPopoverButton,
  PageLayout: PluginPageLayout,
  BarChart: PluginBarChart,
  LineChart: PluginLineChart,
  AreaChart: PluginAreaChart,
  PieChart: PluginPieChart,
  Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription,
  Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} as unknown as IPluginUi;
