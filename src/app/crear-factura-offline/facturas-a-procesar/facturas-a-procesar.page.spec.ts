import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasAProcesarPage } from './facturas-a-procesar.page';

describe('FacturasAProcesarPage', () => {
  let component: FacturasAProcesarPage;
  let fixture: ComponentFixture<FacturasAProcesarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacturasAProcesarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturasAProcesarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
