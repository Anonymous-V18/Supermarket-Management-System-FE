import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionShowComponent } from './promotion-show.component';

describe('PromotionShowComponent', () => {
  let component: PromotionShowComponent;
  let fixture: ComponentFixture<PromotionShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionShowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
