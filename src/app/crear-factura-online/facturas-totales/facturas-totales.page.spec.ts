import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasTotalesPage } from './facturas-totales.page';

describe('FacturasTotalesPage', () => {
  let component: FacturasTotalesPage;
  let fixture: ComponentFixture<FacturasTotalesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacturasTotalesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturasTotalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
