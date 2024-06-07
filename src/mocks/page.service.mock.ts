import { PageTitleService } from "src/app/core/page-title/page-title.service";
import {} from 'jasmine';
const pageTitleService = jasmine.createSpyObj<PageTitleService>('pageTitleService', ['setTitle']);

export const mockPageTitleService = {
    setTitle: pageTitleService.setTitle.and.returnValue(),
}